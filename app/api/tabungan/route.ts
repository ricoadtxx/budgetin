import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function GET() {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	try {
		const tabungan = await prisma.tabungan.findMany({
			where: { userId: user.id },
			include: { savingsGoal: true },
		});

		return new Response(JSON.stringify(tabungan), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching tabungan:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
