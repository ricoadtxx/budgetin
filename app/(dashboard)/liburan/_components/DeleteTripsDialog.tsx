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
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
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
