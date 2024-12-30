"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateTabunganSchemaType } from "@/schema/tabungan";

export const createTabungan = async (data: CreateTabunganSchemaType) => {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	try {
		// Validasi: Pastikan savingsGoalId disediakan
		if (!data.savingsGoalId) {
			throw new Error("Savings goal (trip) harus dipilih.");
		}

		// Gunakan prisma.$transaction untuk atomicity
		const tabungan = await prisma.$transaction(async (prisma) => {
			// Jika transactionId disediakan, validasi dan kurangi amount dari transaksi tersebut
			if (data.transactionId) {
				const transaction = await prisma.transactions.findUnique({
					where: {
						id: data.transactionId,
					},
				});

				if (!transaction) {
					throw new Error("Transaction not found.");
				}

				// Pastikan transaksi adalah tipe "income"
				if (transaction.type !== "income") {
					throw new Error("Hanya transaksi income yang dapat digunakan.");
				}

				// Pastikan amount transaksi cukup untuk dikurangi
				if (transaction.amount < data.amount) {
					throw new Error("Amount transaksi tidak cukup.");
				}

				// Kurangi amount dari transaksi
				await prisma.transactions.update({
					where: {
						id: data.transactionId,
					},
					data: {
						amount: transaction.amount - data.amount,
					},
				});
			}

			// Buat data tabungan baru di database
			const tabungan = await prisma.tabungan.create({
				data: {
					userId: user.id,
					savingsGoalId: data.savingsGoalId,
					amount: data.amount,
					description: data.description || "Tabungan dari transaksi income",
				},
			});

			// Ambil data SavingsGoal terkait
			const savingsGoal = await prisma.savingsGoal.findUnique({
				where: {
					id: data.savingsGoalId,
				},
				select: {
					targetAmount: true,
					savedAmount: true,
					status: true,
				},
			});

			if (!savingsGoal) {
				throw new Error("Savings goal not found.");
			}

			// Hitung savedAmount baru
			const savedAmount = savingsGoal.savedAmount + data.amount;

			// Perbarui savedAmount di tabel SavingsGoal
			await prisma.savingsGoal.update({
				where: {
					id: data.savingsGoalId,
				},
				data: {
					savedAmount: savedAmount,
				},
			});

			// Periksa apakah savedAmount sudah mencapai atau melebihi targetAmount
			if (savedAmount >= savingsGoal.targetAmount) {
				// Ubah status di tabel SavingsGoal menjadi "completed"
				await prisma.savingsGoal.update({
					where: {
						id: data.savingsGoalId,
					},
					data: {
						status: "completed",
					},
				});

				// Ubah status di semua Tabungan yang terkait menjadi "completed"
				await prisma.tabungan.updateMany({
					where: {
						savingsGoalId: data.savingsGoalId,
					},
					data: {
						status: "completed",
					},
				});
			}

			return tabungan;
		});

		return tabungan;
	} catch (error) {
		console.error("Failed to create tabungan:", error);
		throw new Error("Failed to create tabungan");
	}
};

export const fetchSavingGoals = async () => {
	// Ambil user yang sedang login
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in"); // Redirect ke halaman sign-in jika user tidak login
	}

	try {
		// Ambil semua Savings Goals yang dimiliki oleh user yang sedang login
		const savingGoals = await prisma.savingsGoal.findMany({
			where: {
				userId: user.id, // Hanya ambil Savings Goals milik user yang sedang login
			},
			select: {
				id: true,
				goalName: true, // Hanya ambil id dan goalName
				status: true,
			},
		});

		return savingGoals; // Kembalikan data Savings Goals
	} catch (error) {
		console.error("Failed to fetch saving goals:", error);
		throw new Error("Failed to fetch saving goals");
	}
};

export const fetchIncomeTransactions = async () => {
	// Ambil user yang sedang login
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in"); // Redirect ke halaman sign-in jika user tidak login
	}

	try {
		// Ambil semua transaksi dengan tipe "income" milik user yang sedang login
		const incomeTransactions = await prisma.transactions.findMany({
			where: {
				userId: user.id, // Hanya ambil transaksi milik user yang sedang login
				type: "income", // Hanya ambil transaksi dengan tipe "income"
			},
			select: {
				id: true,
				amount: true,
				description: true, // Ambil deskripsi untuk ditampilkan di dropdown
				date: true,
			},
		});

		return incomeTransactions; // Kembalikan data transaksi "income"
	} catch (error) {
		console.error("Failed to fetch income transactions:", error);
		throw new Error("Failed to fetch income transactions");
	}
};
