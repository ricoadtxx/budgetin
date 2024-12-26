"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { userSettings } from "@prisma/client";
import { differenceInDays, startOfMonth } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import StatsCards from "./StatsCards";
import CategoriesStats from "./CategoriesStats";

function Overview({ userSettings }: { userSettings: userSettings }) {
	const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
		from: startOfMonth(new Date()),
		to: new Date(),
	});

	return (
		<>
			<div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 py-6 px-4">
				<h2 className="text-3xl font-bold">Overview</h2>
				<div className="flex items-center gap-3">
					<DateRangePicker
						initialDateFrom={dateRange.from}
						initialDateTo={dateRange.to}
						showCompare={false}
						onUpdate={(values) => {
							const { from, to } = values.range;

							if (!from || !to) return;
							if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
								toast.error(
									`The selected date range is too long. Please select a range of up to ${MAX_DATE_RANGE_DAYS} days!.`
								);
								return;
							}

							setDateRange({ from, to });
						}}
					/>
				</div>
			</div>
			<div className="flex w-full flex-col gap-2 px-4">
				<StatsCards
					userSettings={userSettings}
					from={dateRange.from}
					to={dateRange.to}
				/>

				<CategoriesStats
					userSettings={userSettings}
					from={dateRange.from}
					to={dateRange.to}
				/>
			</div>
		</>
	);
}

export default Overview;
