import { Button } from "@/components/atoms/button";
import Link from "next/link";

export default function Navbar() {
	return (
		<nav className="w-full backdrop-blur-lg bg-background/80 fixed top-0 z-50 border-b">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center space-x-8">
					<Link href="/" className="font-bold text-2xl">
						ZINC
					</Link>
					<div className="hidden md:flex space-x-6">
						<Link href="/users" className="text-sm hover:text-primary">
							ZINC Users
						</Link>
						<Link href="/events" className="text-sm hover:text-primary">
							Events
						</Link>
						<Link href="/zain" className="text-sm hover:text-primary">
							Zain Al Mubadara
						</Link>
					</div>
				</div>
				<div className="flex items-center space-x-4">
					<Link href="/ar" className="text-sm hover:text-primary">
						العربية
					</Link>
					<Button variant="ghost" size="sm">
						Login
					</Button>
					<Button size="sm">Sign Up</Button>
				</div>
			</div>
		</nav>
	);
}
