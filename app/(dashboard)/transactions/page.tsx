"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import TransactionsTable from "./_components/TransactionsTable";

function TransactionsPage() {
	const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
		from: startOfMonth(new Date()),
		to: new Date(),
	});
	return (
		<>
			<div className="border-b bg-card">
				<div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 py-8 px-4">
					<div>
						<p className="text-3xl font-bold text-center">Transactions history</p>
					</div>
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
			<div className="px-4">
				<TransactionsTable from={dateRange.from} to={dateRange.to} />
			</div>
		</>
	);
}

export default TransactionsPage;
