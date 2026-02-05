import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_app/product/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-6 px-6">
			<PageHeader
				title="Produtos"
				subtitle="Visualize os produtos disponíveis no sistema."
			/>
		</div>
	);
}
