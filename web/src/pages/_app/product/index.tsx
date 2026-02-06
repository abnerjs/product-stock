import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Check,
	ChevronsUpDown,
	Minus,
	MoreHorizontal,
	Package,
	Pencil,
	Plus,
	Trash2,
	X,
} from "lucide-react";
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
	type CreateProductInput,
	type ProductDetail,
	type ProductQueryParams,
	type RawMaterialInput,
	type UpdateProductInput,
	useCreateProduct,
	useDeleteProduct,
	useProduct,
	useProducts,
	useUpdateProduct,
} from "@/lib/product";
import { useRawMaterials } from "@/lib/raw-material";
import { cn } from "@/lib/utils";

// Validação de search params
const productSearchSchema = z.object({
	search: z.string().optional().catch(""),
	page: z.coerce.number().optional().catch(1),
	selected: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/product/")({
	component: ProductPage,
	validateSearch: productSearchSchema,
	head: () => ({
		meta: [
			{
				title: "Produtos | Controle de Estoque",
			},
		],
	}),
});

function ProductPage() {
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
	const queryParams: ProductQueryParams = {
		search: search || undefined,
		page: page || 1,
		limit: 10,
	};

	// Queries e mutations
	const { data, isLoading, isError, refetch, isFetching } =
		useProducts(queryParams);
	const { data: selectedItem } = useProduct(selected || "");
	const createMutation = useCreateProduct();
	const updateMutation = useUpdateProduct();
	const deleteMutation = useDeleteProduct();

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
			toast.success("Produto excluído com sucesso!");
			if (selected === itemToDelete) {
				handleSelect(undefined);
			}
		} catch {
			toast.error("Erro ao excluir produto");
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
							title="Produtos"
							subtitle="Visualize os produtos disponíveis no sistema."
						/>

						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<SearchBar
								value={localSearch}
								onChange={handleSearch}
								placeholder="Pesquisar produto..."
							/>
							<Button onClick={handleNewItem}>
								<Plus className="h-4 w-4" />
								Novo produto
							</Button>
						</div>

						{isLoading ? (
							<ProductTableSkeleton />
						) : isError ? (
							<ErrorState
								title="Erro ao carregar produtos"
								message="Não foi possível carregar a lista de produtos."
								onRetry={() => refetch()}
								isRetrying={isFetching}
							/>
						) : data?.data.length === 0 ? (
							<Empty className="border">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Package />
									</EmptyMedia>
									<EmptyTitle>Nenhum produto encontrado</EmptyTitle>
									<EmptyDescription>
										{search
											? "Tente ajustar os filtros de pesquisa."
											: "Cadastre seu primeiro produto para começar."}
									</EmptyDescription>
								</EmptyHeader>
								{!search && (
									<Button onClick={handleNewItem}>
										<Plus className="h-4 w-4" />
										Novo produto
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
												<TableHead className="text-right">Preço</TableHead>
												<TableHead className="text-right">
													Matérias-primas
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
														R$ {item.price}
													</TableCell>
													<TableCell className="text-right">
														{item.rawMaterialsCount}
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
					<ProductForm
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
				title="Excluir produto"
				description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
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

function ProductTableSkeleton() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead className="text-right">Preço</TableHead>
						<TableHead className="text-right">Matérias-primas</TableHead>
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
								<Skeleton className="ml-auto h-4 w-16" />
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

// Formulário de produto
const formSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	price: z
		.string()
		.min(1, "Preço é obrigatório")
		.regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
});

interface ProductFormProps {
	item: ProductDetail | null | undefined;
	isNew: boolean;
	onClose: () => void;
	onSuccess: () => void;
	createMutation: ReturnType<typeof useCreateProduct>;
	updateMutation: ReturnType<typeof useUpdateProduct>;
}

function ProductForm({
	item,
	isNew,
	onClose,
	onSuccess,
	createMutation,
	updateMutation,
}: ProductFormProps) {
	// Estado local para matérias-primas selecionadas
	const [selectedRawMaterials, setSelectedRawMaterials] = React.useState<
		RawMaterialInput[]
	>([]);
	const [comboboxOpen, setComboboxOpen] = React.useState(false);

	// Buscar todas as matérias-primas disponíveis
	const { data: rawMaterialsData } = useRawMaterials({ limit: 100 });
	const availableRawMaterials = rawMaterialsData?.data || [];

	// Inicializar matérias-primas quando o item muda
	React.useEffect(() => {
		if (item?.rawMaterials) {
			setSelectedRawMaterials(
				item.rawMaterials.map((rm) => ({
					rawMaterialId: rm.rawMaterialId,
					quantity: rm.quantity,
				})),
			);
		} else {
			setSelectedRawMaterials([]);
		}
	}, [item]);

	const form = useForm({
		defaultValues: {
			name: item?.name || "",
			price: item?.price || "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const payload = {
					...value,
					rawMaterials:
						selectedRawMaterials.length > 0 ? selectedRawMaterials : undefined,
				};

				if (isNew) {
					await createMutation.mutateAsync(payload as CreateProductInput);
					toast.success("Produto criado com sucesso!");
				} else if (item) {
					await updateMutation.mutateAsync({
						id: item.id,
						data: payload as UpdateProductInput,
					});
					toast.success("Produto atualizado com sucesso!");
				}
				onSuccess();
			} catch {
				toast.error(
					isNew ? "Erro ao criar produto" : "Erro ao atualizar produto",
				);
			}
		},
	});

	// Reset form when item changes
	React.useEffect(() => {
		form.reset({
			name: item?.name || "",
			price: item?.price || "",
		});
	}, [item, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	// Handlers para matérias-primas
	const handleSelectRawMaterial = (rawMaterialId: string) => {
		const exists = selectedRawMaterials.find(
			(rm) => rm.rawMaterialId === rawMaterialId,
		);
		if (exists) {
			// Remove se já existe
			setSelectedRawMaterials((prev) =>
				prev.filter((rm) => rm.rawMaterialId !== rawMaterialId),
			);
		} else {
			// Adiciona com quantidade 1
			setSelectedRawMaterials((prev) => [
				...prev,
				{ rawMaterialId, quantity: 1 },
			]);
		}
	};

	const handleQuantityChange = (rawMaterialId: string, delta: number) => {
		setSelectedRawMaterials((prev) =>
			prev.map((rm) => {
				if (rm.rawMaterialId === rawMaterialId) {
					const newQuantity = Math.max(1, rm.quantity + delta);
					return { ...rm, quantity: newQuantity };
				}
				return rm;
			}),
		);
	};

	const handleQuantityInput = (rawMaterialId: string, value: string) => {
		const numValue = Number.parseInt(value, 10);
		if (Number.isNaN(numValue) || numValue < 1) return;

		setSelectedRawMaterials((prev) =>
			prev.map((rm) => {
				if (rm.rawMaterialId === rawMaterialId) {
					return { ...rm, quantity: numValue };
				}
				return rm;
			}),
		);
	};

	const handleRemoveRawMaterial = (rawMaterialId: string) => {
		setSelectedRawMaterials((prev) =>
			prev.filter((rm) => rm.rawMaterialId !== rawMaterialId),
		);
	};

	// Obter nome da matéria-prima pelo ID
	const getRawMaterialName = (rawMaterialId: string) => {
		const rm = availableRawMaterials.find((r) => r.id === rawMaterialId);
		return rm?.name || "Desconhecido";
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">
					{isNew ? "Novo produto" : "Editar produto"}
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
								placeholder="Nome do produto"
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

				<form.Field name="price">
					{(field) => (
						<div className="flex flex-col gap-2">
							<Label htmlFor={field.name}>Preço (R$)</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="0.00"
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

				{/* Seleção de matérias-primas */}
				<div className="flex flex-col gap-2">
					<Label>Matérias-primas</Label>
					<Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={comboboxOpen}
								className="w-full justify-between"
							>
								{selectedRawMaterials.length > 0
									? `${selectedRawMaterials.length} selecionada(s)`
									: "Selecione as matérias-primas..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-full p-0" align="start">
							<Command>
								<CommandInput placeholder="Buscar matéria-prima..." />
								<CommandList>
									<CommandEmpty>Nenhuma matéria-prima encontrada.</CommandEmpty>
									<CommandGroup>
										{availableRawMaterials.map((rm) => {
											const isSelected = selectedRawMaterials.some(
												(s) => s.rawMaterialId === rm.id,
											);
											return (
												<CommandItem
													key={rm.id}
													value={rm.name}
													onSelect={() => handleSelectRawMaterial(rm.id)}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															isSelected ? "opacity-100" : "opacity-0",
														)}
													/>
													{rm.name}
													<Badge variant="secondary" className="ml-auto">
														{rm.quantity} em estoque
													</Badge>
												</CommandItem>
											);
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					{/* Lista de matérias-primas selecionadas com controle de quantidade */}
					{selectedRawMaterials.length > 0 && (
						<div className="mt-2 space-y-2">
							{selectedRawMaterials.map((rm) => (
								<div
									key={rm.rawMaterialId}
									className="flex items-center justify-between rounded-md border p-2"
								>
									<span className="text-sm font-medium">
										{getRawMaterialName(rm.rawMaterialId)}
									</span>
									<div className="flex items-center gap-1">
										<Button
											type="button"
											size="icon-xs"
											onClick={() => handleQuantityChange(rm.rawMaterialId, -1)}
											disabled={rm.quantity <= 1}
										>
											<Minus className="h-3 w-3" />
										</Button>
										<Input
											type="number"
											min={1}
											value={rm.quantity}
											onChange={(e) =>
												handleQuantityInput(rm.rawMaterialId, e.target.value)
											}
											className="h-6 w-12 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										/>
										<Button
											type="button"
											size="icon-xs"
											onClick={() => handleQuantityChange(rm.rawMaterialId, 1)}
										>
											<Plus className="h-3 w-3" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={() => handleRemoveRawMaterial(rm.rawMaterialId)}
											className="ml-1 text-destructive hover:text-destructive"
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

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
