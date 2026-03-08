import { Habit } from '@my-app/db'
import z from 'zod'

import { protectedProcedure } from '../index'

// Better-Auth MongoDB adapter sometimes returns the raw ObjectId as { buffer: Uint8Array } instead of a Hex String
const parseUserId = (id: any): string => {
  if (typeof id === 'string') return id
  if (id?.buffer) return Buffer.from(id.buffer).toString('hex')
  if (id?.toString) return id.toString()
  return String(id)
}

export const habitsRouter = {
  getAll: protectedProcedure.handler(async ({ context }) => {
    const userId = parseUserId(context.session.user.id)
    const habits = await Habit.collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()
    return habits as any[]
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        frequency: z.array(z.string()).default(['Daily']),
        color: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      const newHabit = await Habit.create({
        ...input,
        userId,
        history: [],
      })
      return newHabit.toJSON()
    }),

  toggleDay: protectedProcedure
    .input(z.object({ id: z.string(), date: z.string(), completed: z.boolean() }))
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      const habitDoc = await Habit.collection.findOne({ _id: input.id as any, userId })
      
      if (!habitDoc) {
        throw new Error('Habit not found')
      }

      // Convert back to mongoose document to use .save() and history logic nicely
      const habit = new Habit(habitDoc)
      habit.isNew = false 
      
      const dayIndex = habit.history.findIndex(h => h.date === input.date)
      
      if (dayIndex >= 0) {
        if (habit.history[dayIndex]) {
          habit.history[dayIndex].completed = input.completed
        }
      } else {
        habit.history.push({ date: input.date, completed: input.completed })
      }

      // We use collection.updateOne to be absolutely sure about the ID matching
      await Habit.collection.updateOne(
        { _id: habit._id as any },
        { $set: { history: habit.history, updatedAt: new Date() } }
      )
      
      return habit.toJSON()
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      await Habit.collection.findOneAndDelete({ _id: input.id as any, userId })
      return { success: true }
    }),
}
