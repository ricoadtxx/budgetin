import { z } from "zod";

export const CreateTabunganSchema = z.object({
	savingsGoalId: z.string(),
	amount: z.number(),
	description: z.string().optional(),
	status: z
		.enum(["pending", "active", "cancelled", "completed"])
		.default("pending"), // Optional, default "pending"
	transactionId: z.string().optional(), // Tambahkan field ini
	initialTargetAmount: z.number().optional(), // Tambahkan properti ini
});

export type CreateTabunganSchemaType = z.infer<typeof CreateTabunganSchema>;
