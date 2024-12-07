import { animate, useIsomorphicLayoutEffect } from "framer-motion";
import { useRef } from "react";
import { useInView } from "react-intersection-observer";

export function AnimatedNumber({ number }: { number: number }) {
	const ref = useRef<HTMLSpanElement>(null);
	const { ref: parent, inView } = useInView();

	useIsomorphicLayoutEffect(() => {
		const element = ref.current;

		if (!element) return;

		element.textContent = "0";

		const controls = animate(0 as number, number, {
			duration: 1,
			ease: "easeOut",
			onUpdate: (value) => {
				element.textContent = value.toFixed(0);
			},
			autoplay: false,
		});

		if (inView) {
			controls.play();
		}

		return () => {
			controls.stop();
		};
	}, [ref, inView]);

	return (
		<div ref={parent} className="text-2xl md:text-3xl font-bold">
			<span ref={ref} />
		</div>
	);
}
