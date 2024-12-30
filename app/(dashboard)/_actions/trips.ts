"use server";

import prisma from "@/lib/prisma";
import {
	CreateTripSchema,
	CreateTripSchemaType,
	DeleteTripsSchema,
	DeleteTripsSchemaType,
	UpdateTripsSchema,
	UpdateTripsSchemaType,
} from "@/schema/trip";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTrips(form: CreateTripSchemaType) {
	console.log("Received form data:", form); // Log input data

	const parseBody = CreateTripSchema.safeParse(form);
	if (!parseBody.success) {
		console.error("Validation failed:", parseBody.error.errors);
		throw new Error(parseBody.error.message);
	}

	const user = await currentUser();
	if (!user) {
		console.warn("User not authenticated");
		redirect("/sign-in");
	}

	console.log("User authenticated:", user.id);

	const { goalName, targetAmount, fromDate, toDate, status } = parseBody.data;

	try {
		const tripRow = await prisma.savingsGoal.create({
			data: {
				userId: user.id,
				goalName,
				targetAmount,
				fromDate,
				toDate,
				status,
			},
		});
		console.log("Trip created successfully:", tripRow);
		return tripRow;
	} catch (error) {
		console.error("Database error:", error);
		throw new Error("Failed to create trip");
	}
}

export async function DeleteTrips(
	form: DeleteTripsSchemaType & { id: string }
) {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	const parseBody = DeleteTripsSchema.safeParse(form);
	if (!parseBody.success) {
		console.error("Validation failed:", parseBody.error.errors);
		throw new Error("bad request");
	}

	try {
		// Hapus semua Tabungan yang terkait dengan SavingsGoal ini
		await prisma.tabungan.deleteMany({
			where: {
				savingsGoalId: form.id,
			},
		});

		console.log("All related Tabungan deleted for SavingsGoal:", form.id);

		// Hapus SavingsGoal
		const deletedTrip = await prisma.savingsGoal.delete({
			where: {
				id: form.id,
			},
		});

		console.log("SavingsGoal deleted successfully:", deletedTrip);
		return deletedTrip;
	} catch (error) {
		console.error("Database error:", error);
		throw new Error("Failed to delete trip and related tabungan");
	}
}

export async function UpdateTrips(
	form: UpdateTripsSchemaType & { id: string }
) {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	const parseBody = UpdateTripsSchema.safeParse(form);
	if (!parseBody.success) {
		throw new Error("Bad request");
	}

	const { id, goalName, savedAmount, targetAmount, status } = parseBody.data;

	console.log("Received data for update:", {
		id,
		goalName,
		savedAmount,
		targetAmount,
		status,
	});

	const validStatuses = ["active", "completed", "cancelled"];
	if (!validStatuses.includes(status)) {
		console.error("Invalid status:", status);
		throw new Error("Invalid status value");
	}

	try {
		// Perbarui data SavingsGoal
		const updatedTrip = await prisma.savingsGoal.update({
			where: { id },
			data: { goalName, savedAmount, targetAmount, status },
		});

		console.log("Trip updated:", updatedTrip);

		// Periksa apakah savedAmount sudah mencapai atau melebihi targetAmount
		if (savedAmount >= targetAmount) {
			// Ubah status di tabel SavingsGoal menjadi "completed"
			await prisma.savingsGoal.update({
				where: { id },
				data: { status: "completed" },
			});

			// Ubah status di semua Tabungan yang terkait menjadi "completed"
			await prisma.tabungan.updateMany({
				where: { savingsGoalId: id },
				data: { status: "completed" },
			});
		}

		return updatedTrip;
	} catch (error) {
		console.error("Database error:", error);
		throw new Error("Database error");
	}
}
