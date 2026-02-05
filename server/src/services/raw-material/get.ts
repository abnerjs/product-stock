import { db } from "@/db"
import { rawMaterial } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getRawMaterialById(id: string) {
  const rawMaterialReturn = await db
    .select()
    .from(rawMaterial)
    .where(eq(rawMaterial.id, id))
    .then((res) => res[0])

  return rawMaterialReturn;
}

export async function getAllRawMaterials() {
  const rawMaterials = await db
    .select()
    .from(rawMaterial)
    .orderBy(rawMaterial.name);
  
  return rawMaterials;
}