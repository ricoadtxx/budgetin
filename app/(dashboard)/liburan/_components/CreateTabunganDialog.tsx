"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	CreateTabunganSchema,
	CreateTabunganSchemaType,
} from "@/schema/tabungan";
import { Loader2 } from "lucide-react";
import { Tabungan } from "@prisma/client";
import {
	createTabungan,
	fetchSavingGoals,
	fetchIncomeTransactions,
} from "../../_actions/tabungan";

interface Props {
	trigger?: ReactNode;
	successCallback: (tabungan: Tabungan) => void;
}

function CreateTabunganDialog({ trigger, successCallback }: Props) {
	const form = useForm<CreateTabunganSchemaType>({
		resolver: zodResolver(CreateTabunganSchema),
		defaultValues: {
			savingsGoalId: "",
			amount: 0,
			description: "",
			status: "pending",
			transactionId: "", // Tambahkan default value untuk transactionId
		},
	});

	const [open, setOpen] = useState(false);

	// Fetch saving goals
	const {
		data: savingGoals,
		isLoading: isSavingGoalsLoading,
		refetch: refetchSavingGoals,
	} = useQuery({
		queryKey: ["savingGoals"],
		queryFn: fetchSavingGoals,
	});

	// Fetch income transactions
	const {
		data: incomeTransactions,
		isLoading: isIncomeTransactionsLoading,
		refetch: refetchIncomeTransactions,
	} = useQuery({
		queryKey: ["incomeTransactions"],
		queryFn: fetchIncomeTransactions,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: createTabungan,
		onSuccess: async (data: Tabungan) => {
			form.reset({
				savingsGoalId: "",
				amount: 0,
				description: "",
				status: "pending",
				transactionId: "", // Reset transactionId
			});

			toast.success("Tabungan created successfully 🎉", {
				id: "create-tabungan",
			});

			successCallback(data);

			setOpen((prev) => !prev);
		},
		onError: () => {
			toast.error("Failed to create tabungan", {
				id: "create-tabungan",
			});
		},
	});

	const onSubmit = useCallback(
		(values: CreateTabunganSchemaType) => {
			toast.loading("Creating Tabungan...", {
				id: "create-tabungan",
			});

			mutate(values);
		},
		[mutate]
	);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			form.reset();
		} else {
			refetchSavingGoals();
			refetchIncomeTransactions();
		}
	};

	const handleGoalChange = (savingsGoalId: string) => {
		const selectedGoal = savingGoals?.find((goal) => goal.id === savingsGoalId);
		if (selectedGoal) {
			form.setValue("status", selectedGoal.status as "pending" | "completed");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-black">
						Create a new<span className="m-1 text-gray-600">Tabungan</span>💰
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						className="space-y-4 text-black"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormField
							control={form.control}
							name="savingsGoalId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your list trip</FormLabel>
									<FormControl>
										<select
											{...field}
											className="w-full p-2 border rounded-md bg-background"
											disabled={isSavingGoalsLoading}
											onChange={(e) => {
												field.onChange(e);
												handleGoalChange(e.target.value);
											}}
										>
											<option value="">Select a trip</option>
											{savingGoals?.map((goal) => (
												<option key={goal.id} value={goal.id}>
													{goal.goalName}
												</option>
											))}
										</select>
									</FormControl>
									<FormDescription className="text-gray-600">
										Select your trip.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="transactionId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Select Income Transaction</FormLabel>
									<FormControl>
										<select
											{...field}
											className="w-full p-2 border rounded-md bg-background"
											disabled={isIncomeTransactionsLoading}
										>
											<option value="">Select an income transaction</option>
											{incomeTransactions?.map((transaction) => (
												<option key={transaction.id} value={transaction.id}>
													{transaction.description} - {transaction.amount}
												</option>
											))}
										</select>
									</FormControl>
									<FormDescription className="text-gray-600">
										This will take the balance from your income
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="Enter Amount"
											{...field}
											onChange={(e) =>
												field.onChange(parseFloat(e.target.value))
											}
										/>
									</FormControl>
									<FormDescription className="text-gray-600">
										The amount of money saved.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input
											className="placeholder:text-gray-600"
											placeholder="Enter Description"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-gray-600">
										A brief description of this tabungan.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<FormControl>
										<select
											{...field}
											className="w-full p-2 border rounded-md text-black bg-background opacity-70"
											disabled
										>
											<option value={field.value}>{field.value}</option>
										</select>
									</FormControl>
									<FormDescription className="text-gray-600">
										You can not change this
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<DialogClose asChild>
								<button
									type="button"
									className="text-sm text-neutral-50 border-black shadow-[3px_3px_#fafafa] cursor-pointer mx-0 px-5 py-2.5 rounded-[5px] border border-solid active:shadow-none active:translate-x-[3px] active:translate-y-[3px] bg-red-500"
									onClick={() => {
										form.reset();
									}}
								>
									Cancel
								</button>
							</DialogClose>
							<button
								className="text-sm text-neutral-50 border-white shadow-[3px_3px_#fafafa] cursor-pointer mx-0 px-5 py-2.5 rounded-[5px] border border-solid active:shadow-none active:translate-x-[3px] active:translate-y-[3px] bg-black"
								type="submit"
								disabled={isPending}
							>
								{!isPending && "Create"}
								{isPending && <Loader2 className="animate-spin" />}
							</button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTabunganDialog;
