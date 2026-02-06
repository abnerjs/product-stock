import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, buildQueryString, paginationSchema } from "./api";

// Schemas
export const productRawMaterialSchema = z.object({
	id: z.string().uuid(),
	rawMaterialId: z.string().uuid(),
	rawMaterialName: z.string(),
	rawMaterialQuantityInStock: z.number(),
	quantity: z.number(),
});

export const productSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	rawMaterialsCount: z.number(),
});

export const productDetailSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	rawMaterials: z.array(productRawMaterialSchema),
});

export const productsResponseSchema = z.object({
	data: z.array(productSchema),
	pagination: paginationSchema,
});

// Summary schemas
export const summaryRawMaterialSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	required: z.number(),
	inStock: z.number(),
});

export const productSummarySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	maxProducible: z.number(),
	canProduce: z.boolean(),
	rawMaterials: z.array(summaryRawMaterialSchema),
});

export const summaryResponseSchema = z.object({
	data: z.array(productSummarySchema),
	pagination: paginationSchema,
});

export type ProductRawMaterial = z.infer<typeof productRawMaterialSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
export type SummaryRawMaterial = z.infer<typeof summaryRawMaterialSchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;

// Query params
export interface ProductQueryParams {
	search?: string;
	page?: number;
	limit?: number;
	orderBy?: "name" | "price";
	order?: "asc" | "desc";
}

export interface SummaryQueryParams {
	search?: string;
	page?: number;
	limit?: number;
	filter?: "all" | "producible" | "not-producible";
}

// Input types
export interface RawMaterialInput {
	rawMaterialId: string;
	quantity: number;
}

export interface CreateProductInput {
	name: string;
	price: string;
	rawMaterials?: RawMaterialInput[];
}

export interface UpdateProductInput {
	name?: string;
	price?: string;
	rawMaterials?: RawMaterialInput[];
}

// API functions
async function getProducts(
	params: ProductQueryParams = {},
): Promise<ProductsResponse> {
	const queryString = buildQueryString({ ...params });
	const response = await apiClient<unknown>(`/product${queryString}`);
	return productsResponseSchema.parse(response);
}

async function getProductSummary(
	params: SummaryQueryParams = {},
): Promise<SummaryResponse> {
	const queryString = buildQueryString({ ...params });
	const response = await apiClient<unknown>(`/product/summary${queryString}`);
	return summaryResponseSchema.parse(response);
}

async function getProductById(id: string): Promise<ProductDetail> {
	const response = await apiClient<unknown>(`/product/${id}`);
	return productDetailSchema.parse(response);
}

async function createProduct(data: CreateProductInput): Promise<{
	id: string;
	name: string;
	price: string;
}> {
	const response = await apiClient<unknown>("/product", {
		method: "POST",
		body: JSON.stringify(data),
	});
	return z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			price: z.string(),
		})
		.parse(response);
}

async function updateProduct(
	id: string,
	data: UpdateProductInput,
): Promise<{ id: string; name: string; price: string }> {
	const response = await apiClient<unknown>(`/product/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
	return z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			price: z.string(),
		})
		.parse(response);
}

async function deleteProduct(id: string): Promise<{
	id: string;
	name: string;
	price: string;
}> {
	const response = await apiClient<unknown>(`/product/${id}`, {
		method: "DELETE",
	});
	return z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			price: z.string(),
		})
		.parse(response);
}

// Query keys
export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (params: ProductQueryParams) =>
		[...productKeys.lists(), params] as const,
	details: () => [...productKeys.all, "detail"] as const,
	detail: (id: string) => [...productKeys.details(), id] as const,
	summaries: () => [...productKeys.all, "summary"] as const,
	summary: (params: SummaryQueryParams) =>
		[...productKeys.summaries(), params] as const,
};

// Hooks
export function useProducts(params: ProductQueryParams = {}) {
	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: () => getProducts(params),
	});
}

export function useProductSummary(params: SummaryQueryParams = {}) {
	return useQuery({
		queryKey: productKeys.summary(params),
		queryFn: () => getProductSummary(params),
	});
}

export function useProduct(id: string) {
	return useQuery({
		queryKey: productKeys.detail(id),
		queryFn: () => getProductById(id),
		enabled: !!id,
	});
}

export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProduct,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
			queryClient.invalidateQueries({ queryKey: productKeys.summaries() });
		},
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
			updateProduct(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
			queryClient.invalidateQueries({ queryKey: productKeys.summaries() });
			queryClient.invalidateQueries({
				queryKey: productKeys.detail(variables.id),
			});
		},
	});
}

export function useDeleteProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteProduct,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
			queryClient.invalidateQueries({ queryKey: productKeys.summaries() });
		},
	});
}
