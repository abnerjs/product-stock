import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rawMaterial } from "@/db/schema";

export interface UpdateRawMaterialInput {
	id: string;
	name?: string;
	quantity?: number;
}

export async function updateRawMaterial(input: UpdateRawMaterialInput) {
	const { id, ...data } = input;

	const [updatedRawMaterial] = await db
		.update(rawMaterial)
		.set(data)
		.where(eq(rawMaterial.id, id))
		.returning();

	return updatedRawMaterial;
}
