import { z } from "zod";

export const CreateTripSchema = z.object({
	goalName: z
		.string()
		.min(1, "Trip name is required")
		.max(100, "Trip name is too long"),
	targetAmount: z.coerce.number().positive().multipleOf(0.01),
	fromDate: z.coerce.date().refine((date) => date > new Date(), {
		message: "From date must be a future date",
	}),
	toDate: z.coerce.date().refine((date) => date > new Date(), {
		message: "To date must be a future date",
	}),
	status: z
		.union([
			z.literal("active"),
			z.literal("completed"),
			z.literal("cancelled"),
		])
		.default("active"),
});

export type CreateTripSchemaType = z.infer<typeof CreateTripSchema>;

export const DeleteTripsSchema = z.object({
	id: z.string(),
	goalName: z
		.string()
		.min(1, "Trip name is required")
		.max(100, "Trip name is too long"),
	status: z.enum(["active", "completed", "cancelled"]),
});
export type DeleteTripsSchemaType = z.infer<typeof DeleteTripsSchema>;

export const UpdateTripsSchema = z.object({
	id: z.string(),
	goalName: z
		.string()
		.min(1, "Trip name is required")
		.max(100, "Trip name is too long"),
	targetAmount: z.coerce.number().positive().multipleOf(0.01),
	savedAmount: z.coerce.number(),
	status: z
		.union([
			z.literal("active"),
			z.literal("completed"),
			z.literal("cancelled"),
		])
		.default("active"),
});

export type UpdateTripsSchemaType = z.infer<typeof UpdateTripsSchema>;
