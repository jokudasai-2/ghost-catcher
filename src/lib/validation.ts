import { z } from 'zod';

export const ghostCategorySchema = z.enum([
  'Process Inefficiency',
  'Technical Issue',
  'Communication Gap',
  'Data Quality',
  'User Experience',
  'Compliance Risk',
  'Other',
]);

export const ghostStatusSchema = z.enum([
  'New',
  'Reported',
  'In Progress',
  'Resolved',
  'Archived',
]);

export const ghostPrioritySchema = z.enum([
  'Low',
  'Medium',
  'High',
  'Critical',
]);

export const createGhostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  category: ghostCategorySchema,
  impact: z.number().int().min(1).max(5).or(z.string().transform((val) => parseInt(val, 10))),
  effort: z.number().int().min(1).max(5).or(z.string().transform((val) => parseInt(val, 10))),
  priority: ghostPrioritySchema.optional(),
  email: z.string().email().optional().or(z.literal('')),
  reporterEmail: z.string().email().optional().or(z.literal('')),
  reporter: z.string().min(1).max(100).optional(),
  department: z.string().max(100).optional(),
  geography: z.string().max(100).optional(),
  riskType: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal('')).or(z.null()),
  pageTitle: z.string().max(300).optional(),
  screenshot: z.string().optional().or(z.null()),
});

export const updateGhostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  category: ghostCategorySchema.optional(),
  impact: z.number().int().min(1).max(5).or(z.string().transform((val) => parseInt(val, 10))).optional(),
  effort: z.number().int().min(1).max(5).or(z.string().transform((val) => parseInt(val, 10))).optional(),
  priority: ghostPrioritySchema.optional(),
  status: ghostStatusSchema.optional(),
  assignedTo: z.string().email().optional().or(z.literal('')).or(z.null()),
  resolutionNotes: z.string().max(2000).optional(),
  resolvedBy: z.string().max(100).optional(),
  resolvedAt: z.string().datetime().optional(),
  dateResolved: z.string().datetime().optional(),
  actualResolutionTime: z.number().int().min(0).optional(),
  pointsAwarded: z.number().int().min(0).optional(),
  escalated: z.boolean().optional(),
  escalatedAt: z.string().datetime().optional(),
  escalatedBy: z.string().max(100).optional(),
  escalationNotes: z.string().max(2000).optional(),
});

export const userSetupSchema = z.object({
  userId: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters'),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
});

export const authSignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters'),
});

export const authSignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type CreateGhostInput = z.infer<typeof createGhostSchema>;
export type UpdateGhostInput = z.infer<typeof updateGhostSchema>;
export type UserSetupInput = z.infer<typeof userSetupSchema>;
export type AuthSignUpInput = z.infer<typeof authSignUpSchema>;
export type AuthSignInInput = z.infer<typeof authSignInSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
