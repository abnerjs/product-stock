import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	isRetrying?: boolean;
}

export function ErrorState({
	title = "Erro ao carregar dados",
	message = "Ocorreu um erro inesperado. Tente novamente.",
	onRetry,
	isRetrying = false,
}: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
				<AlertCircle className="h-6 w-6 text-destructive" />
			</div>
			<div className="space-y-1">
				<h3 className="font-semibold text-destructive">{title}</h3>
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>
			{onRetry && (
				<Button
					variant="outline"
					onClick={onRetry}
					disabled={isRetrying}
					className="gap-2"
				>
					<RefreshCw
						className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
					/>
					{isRetrying ? "Carregando..." : "Tentar novamente"}
				</Button>
			)}
		</div>
	);
}
