import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner"

export const Route = createFileRoute("/_app")({
	component: MainLayout,
});

function MainLayout() {
	return (
		<>
			<div>Hello ""!</div>
			<Outlet />
			<Toaster />
		</>
	)
}
