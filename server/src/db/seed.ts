import { client, db } from ".";
import { product, productRawMaterial, rawMaterial } from "./schema";

async function seed() {
	console.log("Seeding database...");

	const startTime = Date.now();

	await db.delete(productRawMaterial);
	await db.delete(rawMaterial);
	await db.delete(product);

	console.log("\nTables cleared.\n");

	const rawMaterialsId = await db
		.insert(rawMaterial)
		.values([
			{ name: "Steel", quantity: 100 },
			{ name: "Plastic", quantity: 200 },
			{ name: "Rubber", quantity: 150 },
		])
		.returning({ id: rawMaterial.id });

	console.log("Raw materials inserted.");

	const productsId = await db
		.insert(product)
		.values([
			{ name: "Bicycle", price: "199.99" },
			{ name: "Helmet", price: "29.99" },
		])
		.returning({ id: product.id });

	console.log("Products inserted.");

	await db.insert(productRawMaterial).values([
		{
			productId: productsId[0].id,
			rawMaterialId: rawMaterialsId[0].id,
			quantity: 10,
		},
		{
			productId: productsId[0].id,
			rawMaterialId: rawMaterialsId[1].id,
			quantity: 5,
		},
		{
			productId: productsId[1].id,
			rawMaterialId: rawMaterialsId[1].id,
			quantity: 2,
		},
		{
			productId: productsId[1].id,
			rawMaterialId: rawMaterialsId[2].id,
			quantity: 1,
		},
	]);

	console.log("Product raw materials inserted.");

	const endTime = Date.now();
	console.log(
		`\nSeeding completed in ${(endTime - startTime) / 1000} seconds.`,
	);
}

seed()
	.catch((e) => {
		console.error("Error seeding database:", e);
	})
	.finally(() => {
		client.end();
	});
