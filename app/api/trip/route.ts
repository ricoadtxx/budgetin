import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
	// Ambil user yang sedang login
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	const { searchParams } = new URL(request.url);
	const paramStatus = searchParams.get("status");

	const validator = z.enum(["active", "completed", "cancelled"]).nullable();
	const queryParams = validator.safeParse(paramStatus);

	if (!queryParams.success) {
		return new Response(
			JSON.stringify({
				error:
					"Invalid status parameter. Must be 'active', 'completed', or 'cancelled'.",
			}),
			{
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}

	const status = queryParams.data;

	const trips = await prisma.savingsGoal.findMany({
		where: {
			userId: user.id,
			...(status && { status }),
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return new Response(JSON.stringify(trips), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
