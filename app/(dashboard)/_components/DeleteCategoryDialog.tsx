"use client";

import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { DeleteCategory } from "../_actions/categories";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionType } from "@/lib/types";

interface Props {
	trigger: ReactNode;
	category: Category;
}

function DeleteCategoryDialog({ category, trigger }: Props) {
	const categoryIdentifier = `${category.name}-${category.type}`;
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationFn: DeleteCategory,
		onSuccess: async () => {
			toast.success("Category deleted successfully", {
				id: categoryIdentifier,
			});

			await queryClient.invalidateQueries({
				queryKey: ["categories"],
			});
		},
		onError: () => {
			toast.error("Something went wrong", {
				id: categoryIdentifier,
			});
		},
	});
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="text-sm text-neutral-50 border-black shadow-[3px_3px_#fafafa] cursor-pointer mx-0 px-5 py-2.5 rounded-[5px] border border-solid active:shadow-none active:translate-x-[3px] active:translate-y-[3px] bg-red-500">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="text-sm text-neutral-50 border-white shadow-[3px_3px_#fafafa] cursor-pointer mx-0 px-5 py-2.5 rounded-[5px] border border-solid active:shadow-none active:translate-x-[3px] active:translate-y-[3px] bg-black hover:text-black"
						onClick={() => {
							toast.loading("Deleting category...", {
								id: categoryIdentifier,
							});
							deleteMutation.mutate({
								name: category.name,
								type: category.type as TransactionType,
							});
						}}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default DeleteCategoryDialog;
