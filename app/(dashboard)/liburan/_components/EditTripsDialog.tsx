"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SavingsGoal } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import React from "react";
import { UpdateTrips } from "../../_actions/trips";
import { toast } from "sonner";

interface Props {
	trigger?: ReactNode;
	id: string;
}

function EditTripsDialog({ trigger, id }: Props) {
	const [open, setOpen] = useState(false);

	const [goalName, setGoalName] = useState<string | undefined>(undefined);
	const [savedAmount, setSavedAmount] = useState<number | undefined>(undefined);
	const [targetAmount, setTargetAmount] = useState<number | undefined>(
		undefined
	);
	const [status, setStatus] = useState<string | undefined>(undefined);

	const { data, isLoading, error } = useQuery<SavingsGoal>({
		queryKey: ["trip", id],
		queryFn: () => fetch(`/api/trip?id=${id}`).then((res) => res.json()),
		enabled: !!id && open,
	});

	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: UpdateTrips,
		onSuccess: async () => {
			toast.success("Trip updated successfully", {
				id: "update-trip",
			});

			await queryClient.invalidateQueries({
				queryKey: ["trips"],
			});
		},
		onError: () => {
			toast.error("Something went wrong", {
				id: "update-trip",
			});
		},
	});

	useEffect(() => {
		if (!data) return;

		const tripData = Array.isArray(data) ? data[0] : data;
		setGoalName(tripData.goalName);
		setSavedAmount(tripData.savedAmount);
		setTargetAmount(tripData.targetAmount);
		setStatus(tripData.status);
	}, [data]);

	const EditGoalForm = ({
		goalName,
		savedAmount,
		targetAmount,
		status,
	}: {
		goalName?: string;
		savedAmount?: number;
		targetAmount?: number;
		status?: string;
	}) => {
		return (
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Goal Name
					</label>
					<Input type="text" value={goalName} readOnly />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Target
					</label>
					<Input type="number" value={targetAmount} readOnly />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Saved
					</label>
					<Input type="number" value={savedAmount} readOnly />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Status
					</label>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="w-full p-2 rounded-md"
					>
						<option value="active">Active</option>
						<option value="completed">Completed</option>
						<option value="cancelled">Cancelled</option>
					</select>
				</div>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Edit your <span className="m-1 text-rose-300">goal</span>✈️
					</DialogTitle>
				</DialogHeader>
				<SkeletonWrapper isLoading={isLoading}>
					{!isLoading && !error && (
						<EditGoalForm
							goalName={goalName}
							savedAmount={savedAmount}
							targetAmount={targetAmount}
							status={status}
						/>
					)}
				</SkeletonWrapper>

				<DialogFooter className="flex flex-col gap-1 sm:gap-0">
					<Button variant={"outline"} className="bg-red-500">
						Cancel
					</Button>
					<Button
						onClick={() => {
							toast.loading("Saving ...", {
								id: "update-trip",
							});
							updateMutation.mutate({
								id: id,
								goalName: goalName || "",
								savedAmount: savedAmount || 0,
								targetAmount: targetAmount || 0,
								status: status as "active" | "completed" | "cancelled",
							});
						}}
						variant={"ghost"}
						className="bg-gray-700"
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default EditTripsDialog;
