"use client";

import { Button } from "@/components/atoms/button";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import * as m from "framer-motion/m";

import {
	ArrowRight,
	Bell,
	Book,
	Calendar,
	Heart,
	Leaf,
	Network,
	Rocket,
	Search,
	ThumbsUp,
	Users,
} from "lucide-react";
import Navbar from "../molecules/Navbar";
import "@/styles/hero-animation.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Card } from "../atoms/card";
import { AnimatedNumber } from "../molecules/AnimatedNumber";

const iconVariants = {
	initial: { opacity: 0, scale: 0.5 },
	animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
	exit: { opacity: 0, scale: 0.5, transition: { duration: 0.5 } },
};

const colors = [
	"from-emerald-400 to-teal-500",
	"from-blue-400 to-cyan-500",
	"from-violet-400 to-purple-500",
];
const content = [
	{
		heading: "BOOK ZINC FACILITIES",
		subheading: "Your pathway to Growth, Collaboration, and Achievement!",
		icon: Book,
	},
	{
		heading: "POST OPPORTUNITIES",
		subheading: "Share amazing opportunities in our growing community",
		icon: Search,
	},
	{
		heading: "CONNECT WITH PEERS",
		subheading: "Engage with like-minded professionals",
		icon: Users,
	},
	{
		heading: "GROW YOUR NETWORK",
		subheading: "Expand your horizons and reach new heights",
		icon: Network,
	},
	{
		heading: "MANAGE EVENTS",
		subheading: "Create, manage, and track events with ease",
		icon: Calendar,
	},
];

export default function LandingPage() {
	const { ref, inView } = useInView({
		threshold: 0.5,
	});
	const [bgColor, setBgColor] = useState(0);
	const [textIndex, setTextIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!inView) return;
			setIsTransitioning(true);
			setTimeout(() => {
				setBgColor((prev) => (prev + 1) % colors.length);
				setTextIndex((prev) => (prev + 1) % content.length);
				setIsTransitioning(false);
			}, 500);
		}, 5000);
		return () => clearInterval(interval);
	}, [inView]);

	const CurrentIcon = content[textIndex].icon;

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main
				className={`flex-1 pt-16 bg-gradient-to-br transition-colors duration-1000 ease-in-out ${colors[bgColor]}`}
			>
				<div
					className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]"
					ref={ref}
				>
					<div className="relative w-64 h-64 mb-4">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="relative">
								<div className="absolute inset-0 animate-ping bg-white/20 rounded-full" />
								<AnimatePresence mode="wait">
									<LazyMotion features={domAnimation}>
										<m.div
											key={textIndex}
											variants={iconVariants}
											initial="initial"
											animate="animate"
											exit="exit"
										>
											<CurrentIcon className="w-20 h-20 text-white" />
										</m.div>
									</LazyMotion>
								</AnimatePresence>
							</div>
						</div>

						<div className="absolute inset-0 animate-spin">
							<Bell className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 text-white" />
							<Heart className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 text-white" />
							<ThumbsUp className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-white" />
							<Search className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-white" />
						</div>
					</div>

					<div className="overflow-hidden">
						<h1
							className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center tracking-tight transition-transform duration-500 ease-in-out ${
								isTransitioning
									? "-translate-y-full opacity-0"
									: "translate-y-0 opacity-100"
							}`}
						>
							{content[textIndex].heading}
						</h1>
					</div>
					<div className="overflow-hidden h-16 md:h-20">
						<p
							className={`text-lg md:text-xl text-white/90 text-center max-w-2xl transition-transform duration-500 ease-in-out ${
								isTransitioning
									? "-translate-y-full opacity-0"
									: "translate-y-0 opacity-100"
							}`}
						>
							{content[textIndex].subheading}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<Button
							size="lg"
							variant="default"
							className="bg-white text-primary hover:bg-white/90"
						>
							<ArrowRight className="mr-2 h-4 w-4" /> Become a Member
						</Button>
					</div>
				</div>
			</main>
			<div className="container mx-auto p-12">
				<div className="container mx-auto px-4 py-12">
					<div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
						<div className="space-y-8">
							<div className="space-y-6 flex justify-center flex-col md:block">
								<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none md:text-left text-center">
									Zain Innovation Campus (ZINC)
								</h1>
								<p className="text-sm md:text-lg text-muted-foreground md:text-left text-center tracking-tight">
									Considered a landmark in the entrepreneurial ecosystem in
									Jordan, Zain Innovation Campus (ZINC) left a mark on every
									entrepreneur who visited it and contributed in turning an
									innovative idea to a sustainable project that benefits the
									local community, whereas ZINC played an major role in
									supporting youth, as it became a first choice to be selected
									by startups in the kingdom, and the destination for
									entrepreneurial ideas, and the house that hold various events
									and sessions that highlight the most important issues of
									concern to youth and entrepreneurs.
								</p>
								<div className="self-center w-fit">
									<Button variant="default" size="lg">
										<ArrowRight className="mr-2" />
										Become A Member
									</Button>
								</div>
							</div>
						</div>
						<div className="rounded-xl overflow-hidden shadow-lg">
							<Card
								className=" bg-white/50 backdrop-blur shadow-sm rounded-b-none"
								security=""
							>
								<div className="grid grid-cols-3 md:divide-x">
									<div className="p-6 text-center space-y-2">
										<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-rose-50">
											<Rocket className="h-4 w-4 md:h-6 md:w-6 text-rose-500" />
										</div>
										<div className="text-3xl font-bold">
											<AnimatedNumber number={22} />
										</div>
										<div className="font-semibold md:font-normal text-xs text-muted-foreground">
											Startups
										</div>
									</div>
									<div className="p-6 text-center space-y-2">
										<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-emerald-50">
											<Leaf className="h-4 w-4 md:h-6 md:w-6 text-emerald-500" />
										</div>
										<div className="text-3xl font-bold">
											<AnimatedNumber number={4} />
										</div>
										<div className="font-semibold md:font-normal text-xs text-muted-foreground -ml-1 md:ml-0">
											Ecosystem
										</div>
									</div>
									<div className="p-6 text-center space-y-2 ">
										<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-50">
											<Calendar className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
										</div>
										<div className="text-3xl font-bold">
											<AnimatedNumber number={88} />
										</div>
										<div className="font-semibold md:font-normal text-xs text-muted-foreground">
											Events
										</div>
									</div>
								</div>
							</Card>
							<Image
								src="/assets/zinc-image-large.png"
								alt="Zain ZINC Logo"
								width={1000}
								height={300}
								objectFit="cover"
								priority
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
