"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	CreateCategorySchema,
	CreateCategorySchemaType,
} from "@/schema/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import React, { ReactNode, useCallback } from "react";
import { useForm } from "react-hook-form";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category } from "@prisma/client";
import { CreateCategory } from "../_actions/categories";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Props {
	type: TransactionType;
	successCallback: (category: Category) => void;
	trigger?: ReactNode;
}

function CreateCategoryDialog({ type, successCallback, trigger }: Props) {
	const [open, setOpen] = React.useState(false);
	const form = useForm<CreateCategorySchemaType>({
		resolver: zodResolver(CreateCategorySchema),
		defaultValues: {
			type,
		},
	});

	const queryClient = useQueryClient();
	const theme = useTheme();

	const { mutate, isPending } = useMutation({
		mutationFn: CreateCategory,
		onSuccess: async (data: Category) => {
			form.reset({
				name: "",
				icon: "",
				type,
			});

			toast.success(`Category ${data.name} created successfully 🎉`, {
				id: "create-category",
			});

			successCallback(data);

			await queryClient.invalidateQueries({
				queryKey: ["categories"],
			});

			setOpen((prev) => !prev);
		},
		onError: () => {
			toast.error("Something went wrong", {
				id: "create-category",
			});
		},
	});

	const onSubmit = useCallback(
		(values: CreateCategorySchemaType) => {
			toast.loading("Creating category...", {
				id: "create-category",
			});
			mutate(values);
		},
		[mutate]
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="text-black" asChild>
				{trigger ? (
					trigger
				) : (
					<Button
						variant={"ghost"}
						className="flex border-separate items-center justify-start rounded-none border-b p-3 text-muted-foreground"
					>
						<PlusSquare className="mr-2 h-4 w-4" />
						Create new
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-black">
						Create
						<span
							className={cn(
								"m-1",
								type === "income" ? "text-lime-500" : "text-red-500"
							)}
						>
							{type}
						</span>
					</DialogTitle>
					<DialogDescription className="text-gray-600">
						Categories are used to group the transactions you make.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 text-black"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											className="text-gray-600 placeholder:text-gray-600"
											placeholder="Category"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-gray-600">
										Create a category
									</FormDescription>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="icon"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Icon</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant={"outline"}
													className="h-[100px] w-full"
												>
													{form.watch("icon") ? (
														<div className="flex flex-col items-center gap-2">
															<span className="text-5xl" role="img">
																{field.value}
															</span>
															<p className="text-xs text-gray-600">
																Click to change
															</p>
														</div>
													) : (
														<div className="flex flex-col items-center gap-2">
															<CircleOff className="h-[48px] w-[48px]" />
															<p className="text-xs text-gray-600">
																Click to select
															</p>
														</div>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-full">
												<Picker
													data={data}
													theme={theme.resolvedTheme}
													onEmojiSelect={(emoji: { native: string }) => {
														field.onChange(emoji.native);
													}}
												/>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormDescription className="text-gray-600">
										This is how your category will be represented
									</FormDescription>
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<DialogClose asChild>
						<button
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
						onClick={form.handleSubmit(onSubmit)}
						disabled={isPending}
					>
						{!isPending && "Create"}
						{isPending && <Loader2 className="animate-spin" />}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateCategoryDialog;
