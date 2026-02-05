import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export async function apiClient<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || `HTTP error! status: ${response.status}`);
	}

	return response.json();
}

// Pagination schema
export const paginationSchema = z.object({
	page: z.number(),
	limit: z.number(),
	total: z.number(),
	totalPages: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

// Build query string from params
export function buildQueryString(
	params: Record<string, string | number | boolean | undefined | null>,
): string {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== "") {
			searchParams.append(key, String(value));
		}
	}

	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : "";
}
