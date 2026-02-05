import { eq, type InferSelectModel } from "drizzle-orm";
import { db } from "@/db";
import { product, productRawMaterial } from "@/db/schema";
import type { RawMaterialInput } from "./create";

export interface UpdateProductInput {
	id: string;
	name?: string;
	price?: string;
	rawMaterials?: RawMaterialInput[];
}

export async function updateProduct(input: UpdateProductInput) {
	const { id, rawMaterials, ...data } = input;

	return await db.transaction(async (tx) => {
		// Update product basic info if provided
		const updateData: { name?: string; price?: string } = {};
		if (data.name !== undefined) updateData.name = data.name;
		if (data.price !== undefined) updateData.price = data.price;

		let updatedProduct: InferSelectModel<typeof product> | undefined;
		if (Object.keys(updateData).length > 0) {
			[updatedProduct] = await tx
				.update(product)
				.set(updateData)
				.where(eq(product.id, id))
				.returning();
		} else {
			updatedProduct = await tx
				.select()
				.from(product)
				.where(eq(product.id, id))
				.then((res) => res[0]);
		}

		// Update raw materials if provided (replace all)
		if (rawMaterials !== undefined) {
			// Delete existing relationships
			await tx
				.delete(productRawMaterial)
				.where(eq(productRawMaterial.productId, id));

			// Insert new relationships if any
			if (rawMaterials.length > 0) {
				await tx.insert(productRawMaterial).values(
					rawMaterials.map((rm) => ({
						productId: id,
						rawMaterialId: rm.rawMaterialId,
						quantity: rm.quantity,
					})),
				);
			}
		}

		return updatedProduct;
	});
}
