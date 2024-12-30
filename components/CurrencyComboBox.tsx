"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Currencies, Currency } from "@/lib/currencies";
import { useMutation, useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "./SkeletonWrapper";
import { userSettings } from "@prisma/client";
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings";
import { toast } from "sonner";

export function CurrencyComboBox() {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [selectedOption, setselectedOption] = React.useState<Currency | null>(
		null
	);

	const userSettings = useQuery<userSettings>({
		queryKey: ["userSettings"],
		queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
	});

	React.useEffect(() => {
		if (!userSettings.data) return;
		const userCurrency = Currencies.find(
			(currency) => currency.value === userSettings.data.currency
		);
		if (userCurrency) setselectedOption(userCurrency);
	}, [userSettings.data]);

	const mutation = useMutation({
		mutationFn: UpdateUserCurrency,
		onSuccess: (data: userSettings) => {
			toast.success(`Currency updated`, {
				id: "update-currency",
			});

			setselectedOption(
				Currencies.find((c) => c.value === data.currency) || null
			);
		},

		onError: (e) => {
			console.error(e);
			toast.error("Failed to update currency", {
				id: "update-currency",
			});
		},
	});

	const selectOption = React.useCallback(
		(currency: Currency | null) => {
			if (!currency) {
				toast.error("Please select a currency");
				return;
			}

			toast.loading("Updating currency...", {
				id: "update-currency",
			});

			mutation.mutate(currency.value);
		},
		[mutation]
	);

	if (isDesktop) {
		return (
			<SkeletonWrapper isLoading={userSettings.isFetching}>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger className="text-black" asChild>
						<Button
							variant="outline"
							className="w-full justify-start"
							disabled={mutation.isPending}
						>
							{selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0" align="start">
						<OptionList setOpen={setOpen} setselectedOption={selectOption} />
					</PopoverContent>
				</Popover>
			</SkeletonWrapper>
		);
	}

	return (
		<SkeletonWrapper isLoading={userSettings.isFetching}>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-start"
						disabled={mutation.isPending}
					>
						{selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="mt-4 border-t">
						<OptionList setOpen={setOpen} setselectedOption={selectOption} />
					</div>
				</DrawerContent>
			</Drawer>
		</SkeletonWrapper>
	);
}

function OptionList({
	setOpen,
	setselectedOption,
}: {
	setOpen: (open: boolean) => void;
	setselectedOption: (status: Currency | null) => void;
}) {
	return (
		<Command className="bg-background">
			<CommandInput className="text-gray-600" placeholder="Filter currency..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup className="text-black">
					{Currencies.map((currency: Currency) => (
						<CommandItem
							key={currency.value}
							value={currency.value}
							onSelect={(value: string) => {
								setselectedOption(
									Currencies.find((priority) => priority.value === value) ||
										null
								);
								setOpen(false);
							}}
						>
							{currency.label}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
