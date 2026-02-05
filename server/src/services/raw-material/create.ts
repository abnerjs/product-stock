import { db } from "@/db";
import { rawMaterial } from "@/db/schema";

export interface CreateRawMaterialInput {
	name: string;
	quantity: number;
}

export async function createRawMaterial(input: CreateRawMaterialInput) {
	const [newRawMaterial] = await db
		.insert(rawMaterial)
		.values({
			name: input.name,
			quantity: input.quantity,
		})
		.returning();

	return newRawMaterial;
}
