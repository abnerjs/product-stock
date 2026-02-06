import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Boxes, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import {
	SplitView,
	SplitViewMain,
	SplitViewPanel,
} from "@/components/split-view";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks";
import {
	type RawMaterialQueryParams,
	useCreateRawMaterial,
	useDeleteRawMaterial,
	useRawMaterial,
	useRawMaterials,
	useUpdateRawMaterial,
} from "@/lib/raw-material";
import { cn } from "@/lib/utils";

// Validação de search params
const rawMaterialSearchSchema = z.object({
	search: z.string().optional().catch(""),
	page: z.coerce.number().optional().catch(1),
	selected: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/raw/")({
	component: RawMaterialPage,
	validateSearch: rawMaterialSearchSchema,
	head: () => ({
		meta: [
			{
				title: "Matérias-primas | Controle de Estoque",
			},
		],
	}),
});

function RawMaterialPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { search, page, selected } = Route.useSearch();

	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);
	const [localSearch, setLocalSearch] = React.useState(search || "");

	// Debounce search para evitar muitas requisições
	const debouncedSearch = useDebounce(localSearch, 300);

	// Sincroniza URL com busca debounced
	React.useEffect(() => {
		if (debouncedSearch !== (search || "")) {
			navigate({
				search: { search: debouncedSearch || undefined, page: 1, selected },
			});
		}
	}, [debouncedSearch, search, selected, navigate]);

	// Query params
	const queryParams: RawMaterialQueryParams = {
		search: search || undefined,
		page: page || 1,
		limit: 10,
	};

	// Queries e mutations
	const { data, isLoading, isError, refetch, isFetching } =
		useRawMaterials(queryParams);
	const { data: selectedItem } = useRawMaterial(selected || "");
	const createMutation = useCreateRawMaterial();
	const updateMutation = useUpdateRawMaterial();
	const deleteMutation = useDeleteRawMaterial();

	// Handlers
	const handleSearch = (value: string) => {
		setLocalSearch(value);
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			search: { search, page: newPage, selected },
		});
	};

	const handleSelect = (id: string | undefined) => {
		navigate({
			search: { search, page, selected: id },
		});
	};

	const handleEdit = (id: string) => {
		handleSelect(id);
	};

	const handleDelete = (id: string) => {
		setItemToDelete(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!itemToDelete) return;

		try {
			await deleteMutation.mutateAsync(itemToDelete);
			toast.success("Matéria-prima excluída com sucesso!");
			if (selected === itemToDelete) {
				handleSelect(undefined);
			}
		} catch {
			toast.error("Erro ao excluir matéria-prima");
		} finally {
			setDeleteDialogOpen(false);
			setItemToDelete(null);
		}
	};

	const handleNewItem = () => {
		handleSelect("new");
	};

	const handleClosePanel = () => {
		handleSelect(undefined);
	};

	const isFormOpen = !!selected;

	return (
		<>
			<SplitView
				open={isFormOpen}
				onOpenChange={(open) => !open && handleClosePanel()}
			>
				<SplitViewMain>
					<div className={cn("flex flex-col gap-4")}>
						<PageHeader
							title="Matérias-primas"
							subtitle="Visualize as matérias-primas disponíveis no estoque."
						/>

						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<SearchBar
								value={localSearch}
								onChange={handleSearch}
								placeholder="Pesquisar matéria-prima..."
							/>
							<Button onClick={handleNewItem} className="outline-none!">
								<Plus className="h-4 w-4" />
								Nova matéria-prima
							</Button>
						</div>

						{isLoading ? (
							<RawMaterialTableSkeleton />
						) : isError ? (
							<ErrorState
								title="Erro ao carregar matérias-primas"
								message="Não foi possível carregar a lista de matérias-primas."
								onRetry={() => refetch()}
								isRetrying={isFetching}
							/>
						) : data?.data.length === 0 ? (
							<Empty className="border">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Boxes />
									</EmptyMedia>
									<EmptyTitle>Nenhuma matéria-prima encontrada</EmptyTitle>
									<EmptyDescription>
										{search
											? "Tente ajustar os filtros de pesquisa."
											: "Cadastre sua primeira matéria-prima para começar."}
									</EmptyDescription>
								</EmptyHeader>
								{!search && (
									<Button onClick={handleNewItem}>
										<Plus className="h-4 w-4" />
										Nova matéria-prima
									</Button>
								)}
							</Empty>
						) : (
							<>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Nome</TableHead>
												<TableHead className="text-right">
													Quantidade em estoque
												</TableHead>
												<TableHead className="text-right">
													Produtos que utilizam
												</TableHead>
												<TableHead className="w-12.5" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{data?.data.map((item) => (
												<TableRow
													key={item.id}
													data-state={
														selected === item.id ? "selected" : undefined
													}
													className="cursor-pointer"
													onClick={() => handleEdit(item.id)}
												>
													<TableCell className="font-medium">
														{item.name}
													</TableCell>
													<TableCell className="text-right">
														{item.quantity}
													</TableCell>
													<TableCell className="text-right">
														{item.productsCount}
													</TableCell>
													<TableCell>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon-xs"
																	onClick={(e) => e.stopPropagation()}
																	className="size-6!"
																>
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</PopoverTrigger>
															<PopoverContent align="end" className="w-40 p-1">
																<Button
																	variant="ghost"
																	size="sm"
																	className="w-full justify-start"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleEdit(item.id);
																	}}
																>
																	<Pencil className="h-4 w-4" />
																	Editar
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	className="w-full justify-start text-destructive hover:text-destructive"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDelete(item.id);
																	}}
																>
																	<Trash2 className="h-4 w-4" />
																	Excluir
																</Button>
															</PopoverContent>
														</Popover>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
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
															Math.min(
																data.pagination.totalPages,
																(page || 1) + 1,
															),
														)
													}
													aria-disabled={
														(page || 1) >= data.pagination.totalPages
													}
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
				</SplitViewMain>

				<SplitViewPanel className={cn("p-4 md:p-6")}>
					<RawMaterialForm
						item={selected === "new" ? null : selectedItem}
						isNew={selected === "new"}
						onClose={handleClosePanel}
						onSuccess={() => {
							if (selected === "new") {
								handleClosePanel();
							}
						}}
						createMutation={createMutation}
						updateMutation={updateMutation}
					/>
				</SplitViewPanel>
			</SplitView>

			<DeleteConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={confirmDelete}
				title="Excluir matéria-prima"
				description="Tem certeza que deseja excluir esta matéria-prima? Esta ação não pode ser desfeita."
				isLoading={deleteMutation.isPending}
			/>
		</>
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

function RawMaterialTableSkeleton() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead className="text-right">Quantidade em estoque</TableHead>
						<TableHead className="text-right">Produtos que utilizam</TableHead>
						<TableHead className="w-12.5" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{SKELETON_ROWS.map((key) => (
						<TableRow key={key}>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-4 w-12" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-4 w-8" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-6" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

// Formulário de matéria-prima
const formSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	quantity: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
});

interface RawMaterialFormProps {
	item: { id: string; name: string; quantity: number } | null | undefined;
	isNew: boolean;
	onClose: () => void;
	onSuccess: () => void;
	createMutation: ReturnType<typeof useCreateRawMaterial>;
	updateMutation: ReturnType<typeof useUpdateRawMaterial>;
}

function RawMaterialForm({
	item,
	isNew,
	onClose,
	onSuccess,
	createMutation,
	updateMutation,
}: RawMaterialFormProps) {
	const form = useForm({
		defaultValues: {
			name: item?.name || "",
			quantity: item?.quantity || 0,
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				if (isNew) {
					await createMutation.mutateAsync(value);
					toast.success("Matéria-prima criada com sucesso!");
				} else if (item) {
					await updateMutation.mutateAsync({ id: item.id, data: value });
					toast.success("Matéria-prima atualizada com sucesso!");
				}
				onSuccess();
			} catch {
				toast.error(
					isNew
						? "Erro ao criar matéria-prima"
						: "Erro ao atualizar matéria-prima",
				);
			}
		},
	});

	// Reset form when item changes
	React.useEffect(() => {
		form.reset({
			name: item?.name || "",
			quantity: item?.quantity || 0,
		});
	}, [item, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">
					{isNew ? "Nova matéria-prima" : "Editar matéria-prima"}
				</h2>
				<Button variant="ghost" size="icon-xs" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<form.Field name="name">
					{(field) => (
						<div className="flex flex-col gap-2">
							<Label htmlFor={field.name}>Nome</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Nome da matéria-prima"
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="quantity">
					{(field) => (
						<div className="flex flex-col gap-2">
							<Label htmlFor={field.name}>Quantidade em estoque</Label>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								min={0}
								value={field.state.value}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								onBlur={field.handleBlur}
								placeholder="0"
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<div className="flex gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="flex-1"
						disabled={isPending}
					>
						Cancelar
					</Button>
					<Button type="submit" className="flex-1" disabled={isPending}>
						{isPending ? "Salvando..." : isNew ? "Criar" : "Salvar"}
					</Button>
				</div>
			</form>
		</div>
	);
}
