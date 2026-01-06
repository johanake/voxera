import { z } from 'zod'

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  extension: z.string().regex(/^\d{3,5}$/).optional(),
  role: z.enum(['customer_admin', 'manager', 'user']),
  department: z.string().optional(),
  preferences: z
    .object({
      emailNotifications: z.boolean(),
      smsNotifications: z.boolean(),
      newLicenseAssigned: z.boolean(),
      numberPortingUpdates: z.boolean(),
    })
    .optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  extension: z.string().regex(/^\d{3,5}$/).optional(),
  role: z.enum(['customer_admin', 'manager', 'user']).optional(),
  department: z.string().optional(),
  preferences: z
    .object({
      emailNotifications: z.boolean(),
      smsNotifications: z.boolean(),
      newLicenseAssigned: z.boolean(),
      numberPortingUpdates: z.boolean(),
    })
    .optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
