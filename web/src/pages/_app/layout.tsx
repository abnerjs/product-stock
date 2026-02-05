import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
	component: MainLayout,
});

function MainLayout() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1 px-6 pb-4">
				<Outlet />
			</main>
			<Toaster />
		</div>
	);
}
