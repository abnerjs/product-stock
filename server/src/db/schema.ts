import { decimal, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const rawMaterial = pgTable("raw_material", {
	id: uuid()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text().notNull(),
	quantity: integer().notNull().default(0),
});

export const product = pgTable("product", {
	id: uuid()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text().notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const productRawMaterial = pgTable("product_raw_material", {
	id: uuid()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	productId: uuid()
		.notNull()
		.references(() => product.id),
	rawMaterialId: uuid()
		.notNull()
		.references(() => rawMaterial.id),
	quantity: integer().notNull().default(1),
});
