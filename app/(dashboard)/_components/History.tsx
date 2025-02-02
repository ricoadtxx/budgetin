/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Period, Timeframe } from "@/lib/types";
import { userSettings } from "@prisma/client";
import React, { useCallback, useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

function History({ userSettings }: { userSettings: userSettings }) {
	const [timeframe, setTimeframe] = useState<Timeframe>("month");
	const [period, setPeriod] = useState<Period>({
		month: new Date().getMonth(),
		year: new Date().getFullYear(),
	});

	const formatter = useMemo(() => {
		return GetFormatterForCurrency(userSettings.currency);
	}, [userSettings.currency]);

	const historyDataQuery = useQuery({
		queryKey: ["overview", "history", timeframe, period],
		queryFn: () =>
			fetch(
				`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`
			).then((res) => res.json()),
	});

	const dataAvailable =
		historyDataQuery.data && historyDataQuery.data.length > 0;

	return (
		<div className="px-4">
			<h2 className="mt-12 text-3xl text-center font-bold">History</h2>
			<Card className="col-span-12 mt-2 w-full">
				<CardHeader className="gap-2">
					<CardTitle className="grid grid-flow-row justify-center md:justify-between gap-2 md:grid-flow-col">
						<HistoryPeriodSelector
							period={period}
							setPeriod={setPeriod}
							timeframe={timeframe}
							setTimeFrame={setTimeframe}
						/>

						<div className="flex justify-center h-10 gap-2">
							<Badge
								variant={"outline"}
								className="flex items-center border-none gap-2 text-sm text-black"
							>
								<div className="h-4 w-4 rounded-full bg-lime-500"></div>
								Income
							</Badge>
							<Badge
								variant={"outline"}
								className="flex items-center border-none gap-2 text-sm text-black"
							>
								<div className="h-4 w-4 rounded-full bg-red-600"></div>
								Expense
							</Badge>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<SkeletonWrapper isLoading={historyDataQuery.isFetching}>
						{dataAvailable && (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart
									height={300}
									data={historyDataQuery.data}
									barCategoryGap={5}
								>
									<defs>
										<linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset={"0"}
												stopColor="#84cc16"
												stopOpacity={"1"}
											/>
											<stop
												offset={"1"}
												stopColor="#84cc16"
												stopOpacity={"0"}
											/>
										</linearGradient>

										<linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset={"0"}
												stopColor="#dc2626"
												stopOpacity={"1"}
											/>
											<stop
												offset={"1"}
												stopColor="#dc2626"
												stopOpacity={"0"}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="5 5"
										strokeOpacity={"0.2"}
										stroke="#0a0a0a"
										horizontal={true}
										vertical={false}
									/>
									<XAxis
										stroke="#0a0a0a"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										padding={{ left: 5, right: 5 }}
										dataKey={(data) => {
											const { year, month, day } = data;
											const date = new Date(year, month, day || 1);
											if (timeframe === "year") {
												return date.toLocaleDateString("default", {
													month: "long",
												});
											}
											return date.toLocaleDateString("default", {
												day: "2-digit",
											});
										}}
									/>
									<YAxis
										stroke="#0a0a0a"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<Bar
										dataKey={"income"}
										label="Income"
										fill="url(#incomeBar)"
										radius={4}
										className="cursor-pointer"
									/>
									<Bar
										dataKey={"expense"}
										label="Expense"
										fill="url(#expenseBar)"
										radius={4}
										className="cursor-pointer"
									/>
									<Tooltip
										cursor={{ opacity: 0.1 }}
										content={(props) => (
											<CustomTooltip formatter={formatter} {...props} />
										)}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
						{!dataAvailable && (
							<Card className="flex h-[300px] flex-col items-center justify-center bg-background text-black">
								No data for selected period
								<p className="text-sm text-gray-600">
									Try selecting a different period or adding new transactions
								</p>
							</Card>
						)}
					</SkeletonWrapper>
				</CardContent>
			</Card>
		</div>
	);
}

export default History;

function CustomTooltip({ active, payload, formatter }: any) {
	if (!active || !payload || payload.length === 0) return null;

	const data = payload[0].payload;
	const { expense, income } = data;

	return (
		<div className="min-w-[300px] rounded bg-background p-4">
			<TooltipRow
				formatter={formatter}
				label="Expense"
				value={expense}
				bgColor="bg-red-600"
				textColor="text-red-600"
			/>
			<TooltipRow
				formatter={formatter}
				label="Income"
				value={income}
				bgColor="bg-lime-500"
				textColor="text-lime-500"
			/>
			<TooltipRow
				formatter={formatter}
				label="Balance"
				value={income - expense}
				bgColor="bg-gray-500"
				textColor="text-gray-500"
			/>
		</div>
	);
}

function TooltipRow({
	label,
	value,
	bgColor,
	textColor,
	formatter,
}: {
	label: string;
	textColor: string;
	bgColor: string;
	value: number;
	formatter: Intl.NumberFormat;
}) {
	const formattingFn = useCallback(
		(value: number) => {
			return formatter.format(value);
		},
		[formatter]
	);
	return (
		<div className="flex items-center gap-2">
			<div className={cn("h-4 w-4 rounded-full", bgColor)} />
			<div className="flex w-full justify-between">
				<p className="text-sm text-gray-600">{label}</p>
				<div className={cn("text-sm font-bold", textColor)}>
					<CountUp
						duration={0.5}
						preserveValue
						end={value}
						decimals={0}
						formattingFn={formattingFn}
						className="text-sm"
					/>
				</div>
			</div>
		</div>
	);
}
