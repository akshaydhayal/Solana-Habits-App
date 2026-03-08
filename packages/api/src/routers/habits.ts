import { Habit } from '@my-app/db'
import z from 'zod'

import { protectedProcedure } from '../index'

export const habitsRouter = {
  getAll: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 })
    return habits.map(h => h.toJSON())
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
      const userId = context.session.user.id
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
      const userId = context.session.user.id
      const habit = await Habit.findOne({ _id: input.id, userId })
      
      if (!habit) {
        throw new Error('Habit not found')
      }

      const dayIndex = habit.history.findIndex(h => h.date === input.date)
      
      if (dayIndex >= 0) {
        if (habit.history[dayIndex]) {
          habit.history[dayIndex].completed = input.completed
        }
      } else {
        habit.history.push({ date: input.date, completed: input.completed })
      }

      await habit.save()
      return habit.toJSON()
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      await Habit.findOneAndDelete({ _id: input.id, userId })
      return { success: true }
    }),
}
