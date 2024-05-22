import { z } from 'zod'

export const createUserSchema = z.object({
  nickname: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
})

export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  authorId: z.string().uuid(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
})