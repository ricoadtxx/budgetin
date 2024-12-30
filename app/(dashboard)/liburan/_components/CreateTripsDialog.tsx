"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CreateTripSchema, CreateTripSchemaType } from "@/schema/trip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";

interface Props {
	trigger?: ReactNode;
	successCallback: (trip: SavingsGoal) => void;
}

import React from "react";
import { useForm } from "react-hook-form";
import { CreateTrips } from "../../_actions/trips";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { SavingsGoal } from "@prisma/client";

function CreateTripsDialog({ trigger, successCallback }: Props) {
	const form = useForm<CreateTripSchemaType>({
		resolver: zodResolver(CreateTripSchema),
		defaultValues: {
			goalName: "",
			targetAmount: 0,
			fromDate: new Date(),
			toDate: new Date(),
			status: "active",
		},
	});

	const [open, setOpen] = useState(false);

	const { mutate, isPending } = useMutation({
		mutationFn: CreateTrips,
		onSuccess: async (data: SavingsGoal) => {
			form.reset({
				goalName: "",
				targetAmount: 0,
				fromDate: new Date(),
				toDate: new Date(),
				status: undefined,
			});

			toast.success("Trip created successfully 🎉", {
				id: "create-trip",
			});

			successCallback(data);

			setOpen((prev) => !prev);
		},
	});

	const onSubmit = useCallback(
		(values: CreateTripSchemaType) => {
			toast.loading("Creating Trip...", {
				id: "create-trip",
			});

			mutate({
				...values,
				fromDate: DateToUTCDate(values.fromDate),
				toDate: DateToUTCDate(values.toDate),
			});
		},
		[mutate]
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Create a new <span className="m-1 text-rose-300">vacation</span>✈️
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="goalName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your Goal Destination</FormLabel>
									<FormControl>
										<Input
											placeholder="where do you want to go"
											defaultValue={""}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="targetAmount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Budget</FormLabel>
									<FormControl>
										<Input defaultValue={0} type="number" {...field} />
									</FormControl>
									<FormDescription>Budget (required)</FormDescription>
								</FormItem>
							)}
						/>
						<div className="flex justify-between">
							<FormField
								control={form.control}
								name="fromDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>From</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-[200px] pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={(value) => {
														if (!value) return;
														field.onChange(value);
													}}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											Select a date for this vacation
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="toDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>To</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-[200px] pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={(value) => {
														if (!value) return;
														field.onChange(value);
													}}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											Select a date for this vacation
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
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
					<Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
						{!isPending && "Create"}
						{isPending && <Loader2 className="animate-spin" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTripsDialog;
