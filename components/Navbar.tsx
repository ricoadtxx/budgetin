"use client";

import React, { useState } from "react";
import Logo, { LogoMobile } from "./Logo";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";

function Navbar() {
	return (
		<>
			<DesktopNavbar />
			<MobileNavbar />
		</>
	);
}

const items = [
	{ label: "Dashboard", link: "/" },
	{ label: "Transactions", link: "/transactions" },
	{ label: "Manage", link: "/manage" },
	{ label: "Liburan", link: "/liburan" },
];

function MobileNavbar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="text-black block border-separate bg-background md:hidden">
			<nav className="flex items-center justify-between px-8">
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon">
							<Menu />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[400px] sm:w-[540px]">
						<Logo />
						<div className="flex flex-col gap-1 pt-4 text-black">
							{items.map((item) => (
								<NavbarItem
									key={item.label}
									link={item.link}
									label={item.label}
									clickCallback={() => setIsOpen((prev) => !prev)}
								/>
							))}
						</div>
					</SheetContent>
				</Sheet>
				<div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
					<LogoMobile />
				</div>
				<div className="flex items-center gap-2">
					<UserButton />
				</div>
			</nav>
		</div>
	);
}

function DesktopNavbar() {
	return (
		<div className="hidden border-separate border-b border-rose-600 bg-background md:block w-full">
			<nav className="flex items-center justify-between px-8">
				<div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
					<Logo />
					<div className="flex h-full">
						{items.map((item) => (
							<NavbarItem
								key={item.label}
								link={item.link}
								label={item.label}
							/>
						))}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<UserButton />
				</div>
			</nav>
		</div>
	);
}

function NavbarItem({
	label,
	link,
	clickCallback,
}: {
	label: string;
	link: string;
	clickCallback?: () => void;
}) {
	const pathname = usePathname();
	const isActive = pathname === link;

	return (
		<div className="relative flex items-center">
			<Link
				href={link}
				className={cn(
					buttonVariants({ variant: "ghost" }),
					"w-full justify-start text-lg text-black hover:text-foreground",
					isActive && "text-black"
				)}
				onClick={() => {
					if (clickCallback) clickCallback();
				}}
			>
				{label}
			</Link>
			{isActive && (
				<div className="absolute -bottom-[1px] left-1/2 hidden h-[1px] w-[80%] -translate-x-1/2 bg-white md:block" />
			)}
		</div>
	);
}

export default Navbar;
