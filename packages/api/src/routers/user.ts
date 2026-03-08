import { User } from '@my-app/db'
import z from 'zod'

import { protectedProcedure } from '../index'

const parseUserId = (id: any): string => {
  if (typeof id === 'string') return id
  if (id?.buffer) return Buffer.from(id.buffer).toString('hex')
  if (id?.toString) return id.toString()
  return String(id)
}

export const userRouter = {
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        dob: z.string().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      
      // Use findOneAndUpdate instead of findByIdAndUpdate to force a strict String query
      // Better-Auth stores _id as a string, but findById attempts an ObjectId cast if length=24
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { name: input.name, dob: input.dob } },
        { new: true }
      )
      
      if (!updatedUser) {
        throw new Error('User not found in database')
      }
      return updatedUser.toJSON()
    }),
}
