import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rawMaterial } from "@/db/schema";

export async function deleteRawMaterial(id: string) {
	const [deletedRawMaterial] = await db
		.delete(rawMaterial)
		.where(eq(rawMaterial.id, id))
		.returning();

	return deletedRawMaterial;
}
