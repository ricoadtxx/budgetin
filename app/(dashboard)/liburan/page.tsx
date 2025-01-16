"use client";

import React, { useEffect, useState } from "react";
import TripList from "./_components/TripList";
import { userSettings } from "@prisma/client";
import { Loader2, PlusCircleIcon } from "lucide-react";
import CreateTabunganDialog from "./_components/CreateTabunganDialog";
import { Button } from "@/components/ui/button";

function Page() {
	const [userSettings, setUserSettings] = useState<userSettings | null>(null);
	const [isFetching, setIsFetching] = useState(false);

	useEffect(() => {
		setIsFetching(true);
		fetch("/api/user-settings")
			.then((res) => res.json())
			.then((data) => {
				setUserSettings(data);
			})
			.catch((error) => {
				console.error("Failed to fetch user settings:", error);
			})
			.finally(() => {
				setIsFetching(false);
			});
	}, []);

	if (isFetching) {
		return (
			<div className="p-10 flex justify-center items-center">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	if (!userSettings) {
		return (
			<div className="p-10 flex justify-center items-center text-black">
				<p>Failed to load user settings. Please try again later.</p>
			</div>
		);
	}

	return (
		<>
			{/* Start Header */}
			<div className="border-b bg-card">
				<div className="flex flex-wrap items-center justify-center md:justify-between gap-6 py-8 px-4">
					<p className="text-2xl  font-bold text-center text-black">
						This is all the trip you have created
					</p>
					<CreateTabunganDialog
						trigger={
							<Button
								variant={"outline"}
								className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
							>
								Create Tabungan <PlusCircleIcon />
							</Button>
						}
						successCallback={(tabungan) => {
							console.log("Tabungan created:", tabungan);
							setIsFetching(true);
							fetch("/api/tabungan")
								.then((res) => res.json())
								.then((data) => {
									console.log("Data updated:", data);
								})
								.catch((error) => {
									console.error("Failed to fetch data:", error);
								})
								.finally(() => {
									setIsFetching(false);
								});
						}}
					/>
				</div>
			</div>
			{/* End Header */}
			{isFetching && (
				<div className="p-10 flex justify-center items-center">
					<Loader2 className="animate-spin" />
				</div>
			)}
			<div className="flex flex-col gap-4 p-4">
				<TripList userSettings={userSettings} />
			</div>
		</>
	);
}

export default Page;
