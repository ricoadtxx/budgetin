/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { DateToUTCDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { GetTransactionHistoryResponseType } from "@/app/api/transactions-history/route";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";
import { DataTableViewOptions } from "@/components/datatable/ColumnToggle";
import { Button } from "@/components/ui/button";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { DownloadIcon, MoreHorizontal, TrashIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteTransactionDialog from "./DeleteTransactionDialog";

interface Props {
	from: Date;
	to: Date;
}

const emptyData: any[] = [];

type TransactionHistoryRow = GetTransactionHistoryResponseType[0];

const columns: ColumnDef<TransactionHistoryRow>[] = [
	{
		accessorKey: "category",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Category" />
		),
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		cell: ({ row }) => (
			<div className="flex gap-2 capitalize">
				{row.original.categoryIcon}
				<div className="capitalize">{row.original.category}</div>
			</div>
		),
	},
	{
		accessorKey: "description",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Description" />
		),
		cell: ({ row }) => (
			<div className="capitalize">{row.original.description}</div>
		),
	},
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => {
			const date = new Date(row.original.date);
			const formattedDate = date.toLocaleDateString("default", {
				timeZone: "UTC",
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});
			return <div className="text-black ">{formattedDate}</div>;
		},
	},
	{
		accessorKey: "type",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Type" />
		),
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		cell: ({ row }) => (
			<div
				className={cn(
					"capitalize rounded-lg text-center p-2",
					row.original.type === "income" &&
						"bg-primary text-lime-500 font-bold",
					row.original.type === "expense" && "bg-primary text-red-500 font-bold"
				)}
			>
				{row.original.type}
			</div>
		),
	},
	{
		accessorKey: "amount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Amount" />
		),
		cell: ({ row }) => (
			<p className="text-md rounded-lg bg-primary p-2 text-center font-medium">
				{row.original.formattedAmount}
			</p>
		),
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => <RowActions transaction={row.original} />,
	},
];

const csvConfig = mkConfig({
	fieldSeparator: ",",
	decimalSeparator: ".",
	useKeysAsHeaders: true,
});

function TransactionsTable({ from, to }: Props) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const history = useQuery<GetTransactionHistoryResponseType>({
		queryKey: ["transactions", "history", from, to],
		queryFn: () =>
			fetch(
				`/api/transactions-history?from=${DateToUTCDate(
					from
				)}&to=${DateToUTCDate(to)}`
			).then((res) => res.json()),
	});

	const handleExportCSV = (data: any[]) => {
		const csv = generateCsv(csvConfig)(data);
		download(csvConfig)(csv);
	};

	const table = useReactTable({
		data: history.data || emptyData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const categoriesOptions = useMemo(() => {
		const categoriesMap = new Map();
		history.data?.forEach((transaction) => {
			categoriesMap.set(transaction.category, {
				value: transaction.category,
				label: `${transaction.categoryIcon} ${transaction.category}`,
			});
		});
		const uniqueCategories = new Set(categoriesMap.values());
		return Array.from(uniqueCategories);
	}, [history.data]);

	return (
		<div className="w-full">
			<div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 py-4">
				<div className="flex gap-2 text-black">
					{table.getColumn("category") && (
						<DataTableFacetedFilter
							title="Category"
							column={table.getColumn("category")}
							options={categoriesOptions}
						/>
					)}
					{table.getColumn("type") && (
						<DataTableFacetedFilter
							title="Type"
							column={table.getColumn("type")}
							options={[
								{ label: "Income", value: "income" },
								{ label: "Expense", value: "expense" },
							]}
						/>
					)}
				</div>
				<div className="flex flex-wrap gap-2 text-black">
					<Button
						variant={"outline"}
						size={"sm"}
						className="ml-auto h-8 lg:flex"
						onClick={() => {
							const data = table.getFilteredRowModel().rows.map((row) => ({
								category: row.original.category,
								categoryIcon: row.original.categoryIcon,
								description: row.original.description,
								type: row.original.type,
								amount: row.original.amount,
								formattedAmount: row.original.formattedAmount,
								date: row.original.date,
							}));
							handleExportCSV(data);
						}}
					>
						<DownloadIcon className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
					<DataTableViewOptions table={table} />
				</div>
			</div>
			<SkeletonWrapper isLoading={history.isFetching}>
				<div className="rounded-md border text-black">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow className="text-black" key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead className="text-center" key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext()
													  )}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className="text-black">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className="text-black"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell className="text-black" key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="text-black cursor-pointer"
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="text-black cursor-pointer"
					>
						Next
					</Button>
				</div>
			</SkeletonWrapper>
		</div>
	);
}

export default TransactionsTable;

function RowActions({ transaction }: { transaction: TransactionHistoryRow }) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	return (
		<>
			<DeleteTransactionDialog
				open={showDeleteDialog}
				setOpen={setShowDeleteDialog}
				transactionId={transaction.id}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant={"ghost"} className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="bg-background text-black" align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="flex items-center gap-2 text-red-500"
						onSelect={() => {
							setShowDeleteDialog((prev) => !prev);
						}}
					>
						<TrashIcon className="h-4 w-4 text-red-500 " />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
