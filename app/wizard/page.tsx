import { CurrencyComboBox } from "@/components/CurrencyComboBox";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	return (
		<div className="flex max-w-2xl flex-col items-center justify-between gap-4 px-8">
			<div>
				<h1 className="text-center text-3xl">
					Welcome cayangku,
					<span className="ml-2 font-bold">💖💖 {user.firstName} 💖💖</span>
				</h1>
				<h2 className="mt-4 text-center text-base text-muted-foreground">
					Let &apos;s get started with your budget currency, honey
				</h2>

				<h3 className="mt-2 text-center text-sm text-muted-foreground">
					Change settings at any time
				</h3>
			</div>
			<Separator />
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Currency</CardTitle>
					<CardDescription>Choose your currency</CardDescription>
				</CardHeader>
				<CardContent>
					<CurrencyComboBox />
				</CardContent>
			</Card>
			<Separator />
			<Button className="w-full" asChild>
				<Link href={"/"}>I&apos;m done! Let&apos;s got to the dashboard</Link>
			</Button>
			<div className="mt-8">
				<Logo />
			</div>
		</div>
	);
}

export default page;
