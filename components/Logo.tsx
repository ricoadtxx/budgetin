import Link from "next/link";
import { PiggyBank } from "lucide-react";
import React from "react";

function Logo() {
	return (
		<Link href="/" className="flex items-center gap-1">
			<PiggyBank className="stroke h-11 w-11 stroke-red-300 stroke-[1.5]" />
			<p className="bg-gradient-to-r from-red-200 to-red-300 bg-clip-text text-2xl font-bold leading-tight tracking-tighter text-transparent">
				Budget Tracker
			</p>
		</Link>
	);
}

export function LogoMobile() {
	return (
		<Link href="/" className="flex items-center gap-1">
			<p className="bg-gradient-to-r from-red-200 to-red-300 bg-clip-text text-2xl font-bold leading-tight tracking-tighter text-transparent">
				Budget Tracker
			</p>
		</Link>
	);
}

export default Logo;
