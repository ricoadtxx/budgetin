"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
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

function DetailsTripsDialog({ trigger, id }: Props) {
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
			<div className="space-y-4 text-black">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Goal Name
					</label>
					<Input type="text" value={goalName} disabled />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Target
					</label>
					<Input type="number" value={targetAmount} disabled />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Saved
					</label>
					<Input type="number" value={savedAmount} disabled />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Status
					</label>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="w-full p-2 rounded-md bg-card border"
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
					<DialogTitle className="text-black">
						Edit your<span className="m-1 text-gray-600">goal</span>✈️
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
					<button
						className="text-sm text-neutral-50 border-black shadow-[3px_3px_#fafafa] cursor-pointer mx-0 px-5 py-2.5 rounded-[5px] border border-solid active:shadow-none active:translate-x-[3px] active:translate-y-[3px] bg-red-500"
						onClick={() => setOpen(false)}
					>
						Close
					</button>
					<button
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
						className="text-sm text-neutral-50 border-white shadow-[3px_3px_#fafafa] cursor-pointer mx-0 px-5 py-2.5 rounded-[5px] border border-solid active:shadow-none active:translate-x-[3px] active:translate-y-[3px] bg-black"
					>
						Save
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DetailsTripsDialog;
