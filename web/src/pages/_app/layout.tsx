import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
	component: MainLayout,
});

function MainLayout() {
	return (
		<>
			<div>Hello ""!</div>
			<Outlet />
		</>
	)
}
