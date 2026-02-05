import { Search } from "lucide-react";
import * as React from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Pesquisar...",
}: SearchBarProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [isMac, setIsMac] = React.useState(false);

	React.useEffect(() => {
		// Detecta se é Mac
		setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
	}, []);

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+K (Windows/Linux) ou Cmd+K (Mac)
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<InputGroup className="max-w-md">
			<InputGroupAddon align="inline-start">
				<Search className="h-4 w-4 text-muted-foreground" />
			</InputGroupAddon>
			<InputGroupInput
				ref={inputRef}
				type="search"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<InputGroupAddon align="inline-end" className="hidden md:flex">
				<Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
				<Kbd>K</Kbd>
			</InputGroupAddon>
		</InputGroup>
	);
}
