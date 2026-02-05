import { Link, useLocation } from "@tanstack/react-router";
import { Boxes, LayoutDashboard, Package } from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navItems = [
	{
		to: "/",
		label: "Dashboard",
		icon: LayoutDashboard,
	},
	{
		to: "/product",
		label: "Produtos",
		icon: Package,
	},
	{
		to: "/raw",
		label: "Matérias-primas",
		icon: Boxes,
	},
] as const;

export function Navbar() {
	const location = useLocation();

	return (
		<header className="sticky flex items-center top-0 z-50 w-full p-4">
			<div className="flex items-center gap-4 rounded-lg w-full justify-between">
				<div className="flex">
					<Link
						to="/"
						className={cn(
							"flex outline-none p-2 text-black! rounded-lg items-center space-x-2",
							"transition-all",
							"hover:bg-zinc-200 ",
							"focus:ring-3 focus:bg-zinc-200 focus:ring-zinc-300",
						)}
					>
						<span className="font-bold hidden sm:inline-block">
							Controle de Estoque
						</span>
					</Link>
				</div>
				<NavigationMenu>
					<NavigationMenuList>
						{navItems.map((item) => {
							const isActive =
								item.to === "/"
									? location.pathname === "/"
									: location.pathname.startsWith(item.to);
							const Icon = item.icon;

							return (
								<NavigationMenuItem key={item.to}>
									<NavigationMenuLink
										asChild
										active={isActive}
										className={navigationMenuTriggerStyle()}
									>
										<Link
											to={item.to}
											className={cn(
												"flex flex-row items-center gap-2",
												isActive && "bg-zinc-200 text-black!",
											)}
										>
											<Icon className="size-4 text-black!" />
											<span className="hidden sm:inline-block">
												{item.label}
											</span>
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							);
						})}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</header>
	);
}
