"use client";

import { getBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { userSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, WalletIcon } from "lucide-react";
import React, { ReactNode, useCallback, useMemo } from "react";
import CountUp from "react-countup";

interface Props {
	from: Date;
	to: Date;
	userSettings: userSettings;
}

function StatsCards({ from, to, userSettings }: Props) {
	const statsQuery = useQuery<getBalanceStatsResponseType>({
		queryKey: ["overview", "stats", from, to],
		queryFn: () =>
			fetch(
				`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
			).then((res) => res.json()),
	});

	const formatter = useMemo(() => {
		return GetFormatterForCurrency(userSettings.currency);
	}, [userSettings.currency]);

	const income = statsQuery.data?.income || 0;
	const expense = statsQuery.data?.expense || 0;

	const balance = income - expense;

	return (
		<div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
			<SkeletonWrapper isLoading={statsQuery.isFetching}>
				<StatsCard
					formatter={formatter}
					value={income}
					title="Income"
					icon={
						<TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
					}
				/>
			</SkeletonWrapper>

			<SkeletonWrapper isLoading={statsQuery.isFetching}>
				<StatsCard
					formatter={formatter}
					value={expense}
					title="Expense"
					icon={
						<TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
					}
				/>
			</SkeletonWrapper>

			<SkeletonWrapper isLoading={statsQuery.isFetching}>
				<StatsCard
					formatter={formatter}
					value={balance}
					title="Balance"
					icon={
						<WalletIcon className="h-12 w-12 items-center rounded-lg p-2 text-pink-500 bg-pink-400/10" />
					}
				/>
			</SkeletonWrapper>
		</div>
	);
}

export default StatsCards;

function StatsCard({
	formatter,
	value,
	title,
	icon,
}: {
	formatter: Intl.NumberFormat;
	icon: ReactNode;
	title: string;
	value: number;
}) {
	const formatFn = useCallback(
		(value: number) => {
			return formatter.format(value);
		},
		[formatter]
	);

	return (
		<Card className="flex h-24 w-full items-center gap-2 p-4">
			{icon}
			<div className="flex flex-col items-start gap-0">
				<p className="text-sm text-black">{title}</p>
				<CountUp
					preserveValue
					redraw={false}
					end={value}
					decimals={0}
					formattingFn={formatFn}
					className="text-lg text-black"
				/>
			</div>
		</Card>
	);
}
