import { db } from "@/db"
import { product } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getProductById(id: string) {
  const productReturn = await db
    .select()
    .from(product)
    .where(eq(product.id, id))
    .then((res) => res[0])

  return productReturn;
}

export async function getAllProducts() {
  const products = await db
    .select()
    .from(product)
    .orderBy(product.name);
  
  return products;
}