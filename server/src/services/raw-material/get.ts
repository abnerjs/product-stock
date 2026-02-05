import { asc, count, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { productRawMaterial, rawMaterial } from "@/db/schema";

export async function getRawMaterialById(id: string) {
	const rawMaterialReturn = await db
		.select()
		.from(rawMaterial)
		.where(eq(rawMaterial.id, id))
		.then((res) => res[0]);

	return rawMaterialReturn;
}

export interface GetAllRawMaterialsParams {
	search?: string;
	page?: number;
	limit?: number;
	orderBy?: "name" | "quantity";
	order?: "asc" | "desc";
}

export interface PaginatedRawMaterials {
	data: {
		id: string;
		name: string;
		quantity: number;
		productsCount: number;
	}[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export async function getAllRawMaterials(
	params: GetAllRawMaterialsParams = {},
): Promise<PaginatedRawMaterials> {
	const {
		search,
		page = 1,
		limit = 10,
		orderBy = "name",
		order = "asc",
	} = params;

	const offset = (page - 1) * limit;

	// Build where clause
	const whereClause = search
		? ilike(rawMaterial.name, `%${search}%`)
		: undefined;

	// Get total count
	const [{ total }] = await db
		.select({ total: count() })
		.from(rawMaterial)
		.where(whereClause);

	// Build order by
	const orderColumn =
		orderBy === "quantity" ? rawMaterial.quantity : rawMaterial.name;
	const orderDirection =
		order === "desc" ? desc(orderColumn) : asc(orderColumn);

	// Get raw materials with products count
	const rawMaterials = await db
		.select({
			id: rawMaterial.id,
			name: rawMaterial.name,
			quantity: rawMaterial.quantity,
			productsCount: sql<number>`cast(count(${productRawMaterial.productId}) as int)`,
		})
		.from(rawMaterial)
		.leftJoin(
			productRawMaterial,
			eq(rawMaterial.id, productRawMaterial.rawMaterialId),
		)
		.where(whereClause)
		.groupBy(rawMaterial.id, rawMaterial.name, rawMaterial.quantity)
		.orderBy(orderDirection)
		.limit(limit)
		.offset(offset);

	return {
		data: rawMaterials,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}
