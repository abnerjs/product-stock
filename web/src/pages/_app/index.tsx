import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_app/")({
	component: DashboardPage,
	head: () => ({
		meta: [
			{
				title: "Dashboard | Controle de Estoque",
			},
		],
	}),
});

function DashboardPage() {
	return (
		<div className="flex flex-col gap-6 px-6">
			<PageHeader
				title="Seja bem-vindo!"
				subtitle="Visualize os produtos que podem ser produzidos com o estoque atual."
			/>
		</div>
	);
}
