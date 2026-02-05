import { eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { product, productRawMaterial, rawMaterial } from "@/db/schema";

export interface ProductSummary {
	id: string;
	name: string;
	price: string;
	maxProducible: number;
	canProduce: boolean;
	rawMaterials: {
		id: string;
		name: string;
		required: number;
		inStock: number;
	}[];
}

export interface GetSummaryParams {
	search?: string;
	page?: number;
	limit?: number;
	filter?: "all" | "producible" | "not-producible";
}

export interface PaginatedSummary {
	data: ProductSummary[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export async function getProductionSummary(
	params: GetSummaryParams = {},
): Promise<PaginatedSummary> {
	const { search, page = 1, limit = 10, filter = "all" } = params;

	// Get all products with their raw materials
	const products = await db
		.select({
			id: product.id,
			name: product.name,
			price: product.price,
		})
		.from(product)
		.where(search ? ilike(product.name, `%${search}%`) : undefined);

	// For each product, get its raw materials and calculate max producible
	const summaries: ProductSummary[] = [];

	for (const prod of products) {
		const rawMats = await db
			.select({
				id: rawMaterial.id,
				name: rawMaterial.name,
				required: productRawMaterial.quantity,
				inStock: rawMaterial.quantity,
			})
			.from(productRawMaterial)
			.innerJoin(
				rawMaterial,
				eq(productRawMaterial.rawMaterialId, rawMaterial.id),
			)
			.where(eq(productRawMaterial.productId, prod.id));

		// Calculate max producible: minimum of (stock / required) for all raw materials
		let maxProducible = Number.POSITIVE_INFINITY;

		if (rawMats.length === 0) {
			// Product has no raw materials, can't produce
			maxProducible = 0;
		} else {
			for (const mat of rawMats) {
				const ratio = Math.floor(mat.inStock / mat.required);
				if (ratio < maxProducible) {
					maxProducible = ratio;
				}
			}
		}

		// If no raw materials required, set to 0 (infinite doesn't make sense here)
		if (maxProducible === Number.POSITIVE_INFINITY) {
			maxProducible = 0;
		}

		summaries.push({
			id: prod.id,
			name: prod.name,
			price: prod.price,
			maxProducible,
			canProduce: maxProducible > 0,
			rawMaterials: rawMats.map((mat) => ({
				id: mat.id,
				name: mat.name,
				required: mat.required,
				inStock: mat.inStock,
			})),
		});
	}

	// Apply filter
	let filteredSummaries = summaries;
	if (filter === "producible") {
		filteredSummaries = summaries.filter((s) => s.canProduce);
	} else if (filter === "not-producible") {
		filteredSummaries = summaries.filter((s) => !s.canProduce);
	}

	// Sort: higher price first, then higher producible quantity, then alphabetically
	filteredSummaries.sort((a, b) => {
		// First: higher price comes first
		const priceA = Number.parseFloat(a.price);
		const priceB = Number.parseFloat(b.price);
		if (priceA !== priceB) {
			return priceB - priceA;
		}

		// Second: higher maxProducible comes first
		if (a.maxProducible !== b.maxProducible) {
			return b.maxProducible - a.maxProducible;
		}

		// Third: alphabetically by name
		return a.name.localeCompare(b.name);
	});

	// Paginate
	const total = filteredSummaries.length;
	const totalPages = Math.ceil(total / limit);
	const offset = (page - 1) * limit;
	const paginatedData = filteredSummaries.slice(offset, offset + limit);

	return {
		data: paginatedData,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	};
}
