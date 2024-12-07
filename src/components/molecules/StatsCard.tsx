"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import * as m from "framer-motion/m";
import { Calendar, Leaf, Rocket } from "lucide-react";

interface StatProps {
	value: number;
	label: string;
	icon: React.ReactNode;
	delay?: number;
}

function StatItem({ value, label, icon, delay = 0 }: StatProps) {
	return (
		<LazyMotion features={domAnimation}>
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay }}
				className="flex flex-col items-center space-y-2"
			>
				<div className="p-3 bg-white/10 rounded-full">{icon}</div>
				<m.span
					className="text-4xl font-bold"
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: delay + 0.2 }}
				>
					{value}
				</m.span>
				<span className="text-sm text-muted-foreground">{label}</span>
			</m.div>
		</LazyMotion>
	);
}

export function StatsCard() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 p-6">
			<StatItem
				value={22}
				label="Startups"
				icon={<Rocket className="w-6 h-6 text-red-400" />}
				delay={0}
			/>
			<StatItem
				value={4}
				label="Ecosystem"
				icon={<Leaf className="w-6 h-6 text-green-400" />}
				delay={0.2}
			/>
			<StatItem
				value={88}
				label="Events"
				icon={<Calendar className="w-6 h-6 text-blue-400" />}
				delay={0.4}
			/>
		</div>
	);
}
