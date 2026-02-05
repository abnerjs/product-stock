import { eq } from "drizzle-orm";
import { db } from "@/db";
import { product, productRawMaterial } from "@/db/schema";

export async function deleteProduct(id: string) {
	return await db.transaction(async (tx) => {
		// Delete raw material relationships first
		await tx
			.delete(productRawMaterial)
			.where(eq(productRawMaterial.productId, id));

		// Delete product
		const [deletedProduct] = await tx
			.delete(product)
			.where(eq(product.id, id))
			.returning();

		return deletedProduct;
	});
}
