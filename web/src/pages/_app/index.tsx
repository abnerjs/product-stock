import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ChevronDown,
	ChevronUp,
	LayoutDashboard,
	MoreHorizontal,
	Package,
	Pencil,
	Trash2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ProductSummary,
	type SummaryQueryParams,
	useDeleteProduct,
	useProductSummary,
} from "@/lib/product";
import { cn } from "@/lib/utils";

// Validação de search params
const dashboardSearchSchema = z.object({
	search: z.string().optional().catch(""),
	page: z.coerce.number().optional().catch(1),
	filter: z
		.enum(["all", "producible", "not-producible"])
		.optional()
		.catch("all"),
});

export const Route = createFileRoute("/_app/")({
	component: DashboardPage,
	validateSearch: dashboardSearchSchema,
	head: () => ({
		meta: [
			{
				title: "Dashboard | Controle de Estoque",
			},
		],
	}),
});

type FilterOption = {
	value: "all" | "producible" | "not-producible";
	label: string;
};

const filterOptions: FilterOption[] = [
	{ value: "all", label: "Todos" },
	{ value: "producible", label: "Podem ser produzidos" },
	{ value: "not-producible", label: "Não podem ser produzidos" },
];

function DashboardPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { search, page, filter } = Route.useSearch();

	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);
	const [filterOpen, setFilterOpen] = React.useState(false);
	const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
		new Set(),
	);

	// Query params
	const queryParams: SummaryQueryParams = {
		search: search || undefined,
		page: page || 1,
		limit: 10,
		filter: filter || "all",
	};

	// Queries e mutations
	const { data, isLoading, isError } = useProductSummary(queryParams);
	const deleteMutation = useDeleteProduct();

	// Handlers
	const handleSearch = (value: string) => {
		navigate({
			search: { search: value || undefined, page: 1, filter },
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			search: { search, page: newPage, filter },
		});
	};

	const handleFilterChange = (
		newFilter: "all" | "producible" | "not-producible",
	) => {
		navigate({
			search: { search, page: 1, filter: newFilter },
		});
		setFilterOpen(false);
	};

	const handleDelete = (id: string) => {
		setItemToDelete(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!itemToDelete) return;

		try {
			await deleteMutation.mutateAsync(itemToDelete);
			toast.success("Produto excluído com sucesso!");
		} catch {
			toast.error("Erro ao excluir produto");
		} finally {
			setDeleteDialogOpen(false);
			setItemToDelete(null);
		}
	};

	const toggleExpanded = (id: string) => {
		setExpandedItems((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const currentFilterLabel =
		filterOptions.find((opt) => opt.value === (filter || "all"))?.label ||
		"Todos";

	return (
		<>
			<div className="flex flex-col gap-6 px-6">
				<PageHeader
					title="Dashboard"
					subtitle="Visualize os produtos que podem ser produzidos com o estoque atual."
				/>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchBar
						value={search || ""}
						onChange={handleSearch}
						placeholder="Pesquisar produto..."
					/>
					<Popover open={filterOpen} onOpenChange={setFilterOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline" className="w-full sm:w-auto">
								{currentFilterLabel}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-56 p-0" align="end">
							<Command>
								<CommandInput placeholder="Filtrar por..." />
								<CommandList>
									<CommandEmpty>Nenhum filtro encontrado.</CommandEmpty>
									<CommandGroup>
										{filterOptions.map((option) => (
											<CommandItem
												key={option.value}
												value={option.value}
												onSelect={() => handleFilterChange(option.value)}
											>
												{option.label}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{isLoading ? (
					<DashboardSkeleton />
				) : isError ? (
					<div className="text-center text-destructive">
						Erro ao carregar dados
					</div>
				) : data?.data.length === 0 ? (
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<LayoutDashboard />
							</EmptyMedia>
							<EmptyTitle>Nenhum produto encontrado</EmptyTitle>
							<EmptyDescription>
								{search || filter !== "all"
									? "Tente ajustar os filtros de pesquisa."
									: "Cadastre produtos para visualizar o resumo de produção."}
							</EmptyDescription>
						</EmptyHeader>
						{!search && filter === "all" && (
							<Button asChild>
								<Link to="/product">
									<Package className="h-4 w-4" />
									Ver produtos
								</Link>
							</Button>
						)}
					</Empty>
				) : (
					<>
						<div className="space-y-2">
							{data?.data.map((item) => (
								<ProductSummaryCard
									key={item.id}
									item={item}
									expanded={expandedItems.has(item.id)}
									onToggle={() => toggleExpanded(item.id)}
									onDelete={() => handleDelete(item.id)}
								/>
							))}
						</div>

						{data && data.pagination.totalPages > 1 && (
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												handlePageChange(Math.max(1, (page || 1) - 1))
											}
											aria-disabled={(page || 1) <= 1}
											className={
												(page || 1) <= 1
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
									{Array.from(
										{ length: data.pagination.totalPages },
										(_, i) => i + 1,
									).map((pageNum) => (
										<PaginationItem key={pageNum}>
											<PaginationLink
												onClick={() => handlePageChange(pageNum)}
												isActive={pageNum === (page || 1)}
												className="cursor-pointer"
											>
												{pageNum}
											</PaginationLink>
										</PaginationItem>
									))}
									<PaginationItem>
										<PaginationNext
											onClick={() =>
												handlePageChange(
													Math.min(data.pagination.totalPages, (page || 1) + 1),
												)
											}
											aria-disabled={(page || 1) >= data.pagination.totalPages}
											className={
												(page || 1) >= data.pagination.totalPages
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</>
				)}
			</div>

			<DeleteConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={confirmDelete}
				title="Excluir produto"
				description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
				isLoading={deleteMutation.isPending}
			/>
		</>
	);
}

// Card de produto com resumo de produção
interface ProductSummaryCardProps {
	item: ProductSummary;
	expanded: boolean;
	onToggle: () => void;
	onDelete: () => void;
}

function ProductSummaryCard({
	item,
	expanded,
	onToggle,
	onDelete,
}: ProductSummaryCardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border transition-opacity",
				!item.canProduce && "opacity-80",
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4">
				<button
					type="button"
					onClick={onToggle}
					className="flex flex-1 items-center gap-3 text-left"
				>
					<div
						className={cn(
							"hidden sm:flex h-8 w-8 items-center justify-center rounded-full",
							item.canProduce
								? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
								: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
						)}
					>
						<Package className="h-4 w-4" />
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<span className="font-medium">{item.name}</span>
							<Badge
								variant={item.canProduce ? "default" : "secondary"}
								className="text-xs"
							>
								{item.canProduce
									? `Pode produzir ${item.maxProducible}`
									: "Sem estoque"}
							</Badge>
						</div>
						<span className="text-sm text-muted-foreground">
							R$ {item.price} • {item.rawMaterials.length} matéria(s)-prima(s)
						</span>
					</div>
					{expanded ? (
						<ChevronUp className="h-4 w-4 text-muted-foreground" />
					) : (
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					)}
				</button>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon-xs"
							className="ml-2"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-40 p-1">
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-start"
							asChild
						>
							<Link to="/product" search={{ selected: item.id }}>
								<Pencil className="h-4 w-4" />
								Editar
							</Link>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-start text-destructive hover:text-destructive"
							onClick={onDelete}
						>
							<Trash2 className="h-4 w-4" />
							Excluir
						</Button>
					</PopoverContent>
				</Popover>
			</div>

			{/* Content (expandido) */}
			{expanded && item.rawMaterials.length > 0 && (
				<div className="border-t px-4 py-3">
					<div className="text-xs font-medium text-muted-foreground mb-2">
						Matérias-primas necessárias:
					</div>
					<div className="flex flex-wrap gap-2">
						{item.rawMaterials.map((rm) => {
							const hasEnough = rm.inStock >= rm.required;
							return (
								<Badge
									key={rm.id}
									variant="outline"
									className={cn(
										"gap-1.5",
										!hasEnough &&
											"border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
									)}
								>
									<span>{rm.name}</span>
									<span
										className={cn(
											"font-mono text-xs",
											hasEnough
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400",
										)}
									>
										{rm.inStock}/{rm.required}
									</span>
								</Badge>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

// Skeleton para loading
const SKELETON_ROWS = [
	"skeleton-1",
	"skeleton-2",
	"skeleton-3",
	"skeleton-4",
	"skeleton-5",
] as const;

function DashboardSkeleton() {
	return (
		<div className="space-y-2">
			{SKELETON_ROWS.map((key) => (
				<div key={key} className="rounded-lg border p-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="flex-1 space-y-2">
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-5 w-24" />
							</div>
							<Skeleton className="h-3 w-48" />
						</div>
						<Skeleton className="h-4 w-4" />
					</div>
				</div>
			))}
		</div>
	);
}
