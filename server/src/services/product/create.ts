import { db } from "@/db";
import { product, productRawMaterial } from "@/db/schema";

export interface RawMaterialInput {
	rawMaterialId: string;
	quantity: number;
}

export interface CreateProductInput {
	name: string;
	price: string;
	rawMaterials?: RawMaterialInput[];
}

export async function createProduct(input: CreateProductInput) {
	const { name, price, rawMaterials } = input;

	return await db.transaction(async (tx) => {
		// Create product
		const [newProduct] = await tx
			.insert(product)
			.values({
				name,
				price,
			})
			.returning();

		// Add raw materials if provided
		if (rawMaterials && rawMaterials.length > 0) {
			await tx.insert(productRawMaterial).values(
				rawMaterials.map((rm) => ({
					productId: newProduct.id,
					rawMaterialId: rm.rawMaterialId,
					quantity: rm.quantity,
				})),
			);
		}

		return newProduct;
	});
}
