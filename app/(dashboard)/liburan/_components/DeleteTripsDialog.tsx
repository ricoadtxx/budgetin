import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
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
import { SavingsGoal } from "@prisma/client";
import { DeleteTrips } from "../../_actions/trips";

interface Props {
	trigger: ReactNode;
	trips: SavingsGoal;
	id: string;
}

function DeleteTripsDialog({ trigger, trips, id }: Props) {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationFn: DeleteTrips,
		onSuccess: async () => {
			toast.success("Trip deleted successfully", {
				id: id,
			});

			await queryClient.invalidateQueries({
				queryKey: ["trips"],
			});
		},
		onError: () => {
			toast.error("Something went wrong", {
				id: id,
			});
		},
	});
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent className="text-black">
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription className="text-gray-600">
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
								id: id,
							});
							deleteMutation.mutate({
								id: trips.id,
								goalName: trips.goalName,
								status: trips.status as "active" | "completed" | "cancelled",
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

export default DeleteTripsDialog;
