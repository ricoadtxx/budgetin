import { PawPrint } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo() {
	return (
		<Link href="/" className="flex items-center gap-1">
			<PawPrint className="stroke h-8 w-8 stroke-black stroke-[1.5]" />
			<p className="bg-gradient-to-r from-red-700 to-red-400 bg-clip-text text-2xl font-bold leading-tight tracking-tighter text-transparent">
				Budgetin
			</p>
		</Link>
	);
}

export function LogoMobile() {
	return (
		<Link href="/" className="flex items-center gap-1">
			<p className="bg-gradient-to-r from-red-200 to-red-300 bg-clip-text text-2xl font-bold leading-tight tracking-tighter text-transparent">
				Budgetin
			</p>
		</Link>
	);
}

export default Logo;
