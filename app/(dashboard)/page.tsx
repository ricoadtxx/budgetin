import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import CreateTransactionDialog from "./_components/CreateTransactionDialog";
import Overview from "./_components/Overview";
import History from "./_components/History";

async function page() {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	const userSettings = await prisma.userSettings.findUnique({
		where: {
			userId: user.id,
		},
	});

	if (!userSettings) {
		redirect("/wizard");
	}
	return (
		<div className="h-full text-black">
			<div className="border-b border-rose-600 bg-card">
				<div className="flex flex-wrap items-center justify-center md:justify-between gap-6 py-8 px-4">
					<p className="text-2xl font-bold font-sans text-black">
						Hallo {user.firstName}, Selamat Datang
					</p>

					<div className="flex items-center gap-3">
						<CreateTransactionDialog
							trigger={
								<Button
									variant={"outline"}
									className="border-rose-900 bg-background text-black hover:text-white"
								>
									New income 💸
								</Button>
							}
							type="income"
						/>

						<CreateTransactionDialog
							trigger={
								<Button
									variant={"outline"}
									className="border-rose-900 bg-background text-black hover:text-white"
								>
									New expense 💰
								</Button>
							}
							type="expense"
						/>
					</div>
				</div>
			</div>
			<Overview userSettings={userSettings} />
			<History userSettings={userSettings} />
		</div>
	);
}

export default page;
