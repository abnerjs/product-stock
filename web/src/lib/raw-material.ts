import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, buildQueryString, paginationSchema } from "./api";

// Schemas
export const rawMaterialSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	quantity: z.number(),
	productsCount: z.number(),
});

export const rawMaterialDetailSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	quantity: z.number(),
});

export const rawMaterialsResponseSchema = z.object({
	data: z.array(rawMaterialSchema),
	pagination: paginationSchema,
});

export type RawMaterial = z.infer<typeof rawMaterialSchema>;
export type RawMaterialDetail = z.infer<typeof rawMaterialDetailSchema>;
export type RawMaterialsResponse = z.infer<typeof rawMaterialsResponseSchema>;

// Query params
export interface RawMaterialQueryParams {
	search?: string;
	page?: number;
	limit?: number;
	orderBy?: "name" | "quantity";
	order?: "asc" | "desc";
}

// API functions
async function getRawMaterials(
	params: RawMaterialQueryParams = {},
): Promise<RawMaterialsResponse> {
	const queryString = buildQueryString({ ...params });
	const response = await apiClient<unknown>(`/raw${queryString}`);
	return rawMaterialsResponseSchema.parse(response);
}

async function getRawMaterialById(id: string): Promise<RawMaterialDetail> {
	const response = await apiClient<unknown>(`/raw/${id}`);
	return rawMaterialDetailSchema.parse(response);
}

async function createRawMaterial(data: {
	name: string;
	quantity: number;
}): Promise<RawMaterialDetail> {
	const response = await apiClient<unknown>("/raw", {
		method: "POST",
		body: JSON.stringify(data),
	});
	return rawMaterialDetailSchema.parse(response);
}

async function updateRawMaterial(
	id: string,
	data: { name?: string; quantity?: number },
): Promise<RawMaterialDetail> {
	const response = await apiClient<unknown>(`/raw/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
	return rawMaterialDetailSchema.parse(response);
}

async function deleteRawMaterial(id: string): Promise<RawMaterialDetail> {
	const response = await apiClient<unknown>(`/raw/${id}`, {
		method: "DELETE",
	});
	return rawMaterialDetailSchema.parse(response);
}

// Query keys
export const rawMaterialKeys = {
	all: ["raw-materials"] as const,
	lists: () => [...rawMaterialKeys.all, "list"] as const,
	list: (params: RawMaterialQueryParams) =>
		[...rawMaterialKeys.lists(), params] as const,
	details: () => [...rawMaterialKeys.all, "detail"] as const,
	detail: (id: string) => [...rawMaterialKeys.details(), id] as const,
};

// Hooks
export function useRawMaterials(params: RawMaterialQueryParams = {}) {
	return useQuery({
		queryKey: rawMaterialKeys.list(params),
		queryFn: () => getRawMaterials(params),
	});
}

export function useRawMaterial(id: string) {
	return useQuery({
		queryKey: rawMaterialKeys.detail(id),
		queryFn: () => getRawMaterialById(id),
		enabled: !!id,
	});
}

export function useCreateRawMaterial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createRawMaterial,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rawMaterialKeys.lists() });
		},
	});
}

export function useUpdateRawMaterial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: { name?: string; quantity?: number };
		}) => updateRawMaterial(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rawMaterialKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: rawMaterialKeys.detail(variables.id),
			});
		},
	});
}

export function useDeleteRawMaterial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteRawMaterial,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rawMaterialKeys.lists() });
		},
	});
}
