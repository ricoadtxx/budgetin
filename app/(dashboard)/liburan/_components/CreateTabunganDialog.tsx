"use client";

import { Button } from "@/components/ui/button";
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
					<DialogTitle>
						Create a new <span className="m-1 text-rose-300">Tabungan</span>💰
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="savingsGoalId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your list trip</FormLabel>
									<FormControl>
										<select
											{...field}
											className="w-full p-2 border rounded-md"
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
									<FormDescription>Select your trip.</FormDescription>
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
											className="w-full p-2 border rounded-md"
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
									<FormDescription>
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
									<FormDescription>The amount of money saved.</FormDescription>
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
										<Input placeholder="Enter Description" {...field} />
									</FormControl>
									<FormDescription>
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
											className="w-full p-2 border rounded-md"
											disabled
										>
											<option value={field.value}>{field.value}</option>
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<DialogClose asChild>
								<Button
									type="button"
									variant={"secondary"}
									onClick={() => {
										form.reset();
									}}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isPending}>
								{!isPending && "Create"}
								{isPending && <Loader2 className="animate-spin" />}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTabunganDialog;
