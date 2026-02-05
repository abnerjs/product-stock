import { asc, count, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { product, productRawMaterial, rawMaterial } from "@/db/schema";

export async function getProductById(id: string) {
	const productData = await db
		.select()
		.from(product)
		.where(eq(product.id, id))
		.then((res) => res[0]);

	if (!productData) return null;

	// Get raw materials for this product
	const rawMaterials = await db
		.select({
			id: productRawMaterial.id,
			rawMaterialId: productRawMaterial.rawMaterialId,
			rawMaterialName: rawMaterial.name,
			rawMaterialQuantityInStock: rawMaterial.quantity,
			quantity: productRawMaterial.quantity,
		})
		.from(productRawMaterial)
		.innerJoin(
			rawMaterial,
			eq(productRawMaterial.rawMaterialId, rawMaterial.id),
		)
		.where(eq(productRawMaterial.productId, id));

	return {
		...productData,
		rawMaterials,
	};
}

export interface GetAllProductsParams {
	search?: string;
	page?: number;
	limit?: number;
	orderBy?: "name" | "price";
	order?: "asc" | "desc";
}

export interface ProductWithRawMaterialsCount {
	id: string;
	name: string;
	price: string;
	rawMaterialsCount: number;
}

export interface PaginatedProducts {
	data: ProductWithRawMaterialsCount[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export async function getAllProducts(
	params: GetAllProductsParams = {},
): Promise<PaginatedProducts> {
	const {
		search,
		page = 1,
		limit = 10,
		orderBy = "name",
		order = "asc",
	} = params;

	const offset = (page - 1) * limit;

	// Build where clause
	const whereClause = search ? ilike(product.name, `%${search}%`) : undefined;

	// Get total count
	const [{ total }] = await db
		.select({ total: count() })
		.from(product)
		.where(whereClause);

	// Build order by
	const orderColumn = orderBy === "price" ? product.price : product.name;
	const orderDirection =
		order === "desc" ? desc(orderColumn) : asc(orderColumn);

	// Get products with raw materials count
	const products = await db
		.select({
			id: product.id,
			name: product.name,
			price: product.price,
			rawMaterialsCount: sql<number>`cast(count(${productRawMaterial.rawMaterialId}) as int)`,
		})
		.from(product)
		.leftJoin(productRawMaterial, eq(product.id, productRawMaterial.productId))
		.where(whereClause)
		.groupBy(product.id, product.name, product.price)
		.orderBy(orderDirection)
		.limit(limit)
		.offset(offset);

	return {
		data: products,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}
