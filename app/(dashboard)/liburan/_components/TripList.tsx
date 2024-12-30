"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { SavingsGoal, userSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
	FilePenLine,
	PlusCircleIcon,
	TicketsPlane,
	Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import CreateTripsDialog from "./CreateTripsDialog";
import DeleteTripsDialog from "./DeleteTripsDialog";
import EditTripsDialog from "./EditTripsDialog";

function TripList({ userSettings }: { userSettings: userSettings }) {
	const tripsQuery = useQuery<SavingsGoal[]>({
		queryKey: ["trips"],
		queryFn: async () => fetch("/api/trip").then((res) => res.json()),
	});

	const formatter = useMemo(() => {
		if (!userSettings || !userSettings.currency) {
			console.warn("Currency not found in userSettings. Defaulting to 'USD'.");
			return GetFormatterForCurrency("USD");
		}
		return GetFormatterForCurrency(userSettings.currency);
	}, [userSettings]);

	const dataAvailable = tripsQuery.data && tripsQuery.data.length > 0;

	// State untuk search
	const [searchQuery, setSearchQuery] = useState("");

	// Filter data Trip berdasarkan query pencarian
	const filteredTrips =
		tripsQuery.data?.filter((trip) =>
			trip.goalName.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	if (tripsQuery.isError) {
		return (
			<div className="text-center">
				<p className="text-red-500">
					Failed to load trips. Please try again later.
				</p>
			</div>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-rose-400">Your List Trip</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						List of all your trips
					</CardDescription>
				</div>
				<CardContent className="p-0">
					<CreateTripsDialog
						trigger={
							<Button
								variant={"outline"}
								className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
							>
								Create Trip <PlusCircleIcon />
							</Button>
						}
						successCallback={() => tripsQuery.refetch()}
					/>
				</CardContent>
			</CardHeader>
			<Separator />
			{/* Input Search */}
			<div className="p-4">
				<input
					type="text"
					placeholder="Search..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="p-2 border rounded-md w-full max-w-xs"
				/>
			</div>
			<SkeletonWrapper fullWidth isLoading={tripsQuery.isFetching}>
				{!dataAvailable && (
					<div className="flex h-40 w-full flex-col items-center justify-center">
						<p>You don&apos;t have any trips</p>
						<p className="text-sm text-muted-foreground">
							Create your first trip
						</p>
					</div>
				)}
				{dataAvailable && (
					<div
						className="flex overflow-x-auto gap-2 p-2 scroll-snap-x mandatory hide-scrollbar"
						style={{ scrollBehavior: "smooth" }}
					>
						{filteredTrips.map((trip) => (
							<div
								key={trip.id}
								className="flex-shrink-0 w-[calc(100%-1rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(25%-0.5rem)] scroll-snap-align-start"
							>
								<TripsCard formatter={formatter} trip={trip} />
							</div>
						))}
					</div>
				)}
			</SkeletonWrapper>
		</Card>
	);
}

export default TripList;

function TripsCard({
	trip,
	formatter,
}: {
	trip: SavingsGoal;
	formatter: Intl.NumberFormat;
}) {
	const statusClasses = {
		active: "text-yellow-500",
		completed: "text-green-500",
		cancelled: "text-red-500",
	};

	// Hitung persentase savedAmount terhadap targetAmount
	const progressPercentage =
		trip.targetAmount === 0
			? 0 // Jika targetAmount adalah 0, progress adalah 0%
			: (trip.savedAmount / trip.targetAmount) * 100; // Nilai persentase aktual

	// Batasi progress bar hingga 100%
	const progressBarWidth = Math.min(progressPercentage, 100);

	return (
		<Card className="flex flex-col justify-between rounded-md p-4 shadow-md gap-4">
			<div className="flex flex-col gap-1">
				<TicketsPlane className="text-muted-foreground" />
				<h3 className="text-lg font-semibold">{trip.goalName}</h3>
			</div>
			<div className="text-sm flex justify-start gap-1">
				<div className="text-rose-500">
					<p>Target</p>
					<p>Saved</p>
					<p>Deadline</p>
					<p>Status</p>
				</div>
				<div className="text-muted-foreground">
					<p> : {formatter.format(trip.targetAmount)}</p>
					<p> : {formatter.format(trip.savedAmount)}</p>
					<p>
						: {new Date(trip.fromDate).toLocaleDateString()} -
						{new Date(trip.toDate).toLocaleDateString()}
					</p>
					<p>
						:{" "}
						<span
							className={
								statusClasses[trip.status as keyof typeof statusClasses]
							}
						>
							{trip.status}
						</span>
					</p>
				</div>
			</div>
			{/* Progress Bar dengan Nilai Persen */}
			<div className="flex flex-col gap-1">
				<div className="flex justify-between text-sm text-muted-foreground">
					<span>Progress</span>
					<span>{progressPercentage.toFixed(0)}%</span>{" "}
					{/* Nilai persentase aktual */}
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
					<div
						className="bg-rose-500 h-2.5 rounded-full"
						style={{ width: `${progressBarWidth}%` }}
					></div>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<EditTripsDialog
					trigger={
						<Button variant={"outline"} className="bg-gray-700">
							<FilePenLine />
							Edit
						</Button>
					}
					id={trip.id}
				/>
				<DeleteTripsDialog
					trigger={
						<Button variant={"ghost"} className="bg-rose-500">
							<Trash2 />
							Delete
						</Button>
					}
					trips={trip}
					id={trip.id}
				/>
			</div>
		</Card>
	);
}
