import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitViewContextValue {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

const SplitViewContext = React.createContext<SplitViewContextValue | null>(
	null,
);

export function useSplitView() {
	const context = React.useContext(SplitViewContext);
	if (!context) {
		throw new Error("useSplitView must be used within a SplitView");
	}
	return context;
}

interface SplitViewProps {
	children: React.ReactNode;
	gap?: number;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function SplitView({
	children,
	open,
	onOpenChange,
	gap,
}: SplitViewProps) {
	const [internalOpen, setInternalOpen] = React.useState(false);

	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const setIsOpen = React.useCallback(
		(newOpen: boolean) => {
			if (!isControlled) {
				setInternalOpen(newOpen);
			}
			onOpenChange?.(newOpen);
		},
		[isControlled, onOpenChange],
	);

	const translateWithGap = gap && `-translate-x-[calc(200dvw+${gap}px)]`;

	return (
		<SplitViewContext.Provider value={{ isOpen, setIsOpen }}>
			<div className="h-full w-full overflow-hidden">
				<div
					className={cn(
						"flex h-full transition-transform duration-300 ease-in-out",
						// Desktop: 200dvw total, cada parte 100dvw. Quando aberto, cada parte 50dvw
						// Mobile: translate -100dvw para mostrar o formulário
						isOpen
							? `w-[200dvw] md:w-full -translate-x-[100dvw] md:translate-x-0`
							: "w-[200dvw] md:w-full translate-x-0",
					)}
					style={{
						gap: gap,
					}}
				>
					{children}
				</div>
			</div>
		</SplitViewContext.Provider>
	);
}

interface SplitViewContentProps {
	children: React.ReactNode;
	className?: string;
}

export function SplitViewMain({ children, className }: SplitViewContentProps) {
	const { isOpen } = useSplitView();

	return (
		<div
			className={cn(
				"h-full w-dvw shrink-0 px-6 overflow-auto transition-all duration-300",
				isOpen ? "md:w-1/2" : "md:w-full",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function SplitViewPanel({ children, className }: SplitViewContentProps) {
	const { isOpen } = useSplitView();

	return (
		<div
			className={cn(
				"h-full w-dvw shrink-0 px-6 overflow-auto transition-all duration-300",
				isOpen ? "md:w-1/2" : "md:w-0 md:opacity-0",
				className,
			)}
		>
			{isOpen && children}
		</div>
	);
}
