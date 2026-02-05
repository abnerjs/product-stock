import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
	component: IndexPage,
	head: () => ({
		meta: [
			{
				title: "Controle de Estoque",
			},
		],
	}),
});

function IndexPage() {
	return <div>Hello "/"!</div>;
}
