import { client, db } from ".";
import { product, productRawMaterial, rawMaterial } from "./schema";

// Nomes realistas para matérias-primas
const RAW_MATERIAL_NAMES = [
	"Aço Inoxidável",
	"Alumínio",
	"Cobre",
	"Plástico ABS",
	"Plástico PVC",
	"Borracha Natural",
	"Borracha Sintética",
	"Vidro Temperado",
	"Madeira MDF",
	"Madeira Pinus",
	"Tecido Algodão",
	"Tecido Poliéster",
	"Couro Sintético",
	"Couro Natural",
	"Espuma D28",
	"Espuma D45",
	"Parafusos M6",
	"Parafusos M8",
	"Porcas M6",
	"Arruelas",
	"Cola Industrial",
	"Tinta Esmalte",
	"Verniz",
	"Lixa 120",
	"Fita Adesiva",
	"Papelão",
	"Silicone",
	"Resina Epóxi",
	"Fibra de Vidro",
	"Nylon",
	"Polietileno",
	"Polipropileno",
	"Zinco",
	"Latão",
	"Bronze",
	"Feltro",
	"Isopor",
	"EVA",
	"TNT",
	"Velcro",
];

// Nomes realistas para produtos
const PRODUCT_NAMES = [
	"Cadeira Escritório",
	"Mesa Executiva",
	"Estante Industrial",
	"Armário Multiuso",
	"Sofá 3 Lugares",
	"Poltrona Reclinável",
	"Cama Box Casal",
	"Criado Mudo",
	"Rack para TV",
	"Painel Decorativo",
	"Bicicleta Urbana",
	"Patinete Elétrico",
	"Capacete Segurança",
	"Luvas Proteção",
	"Óculos EPI",
	"Caixa Organizadora",
	"Prateleira Modular",
	"Banco Alto",
	"Mesa Centro",
	"Puff Redondo",
	"Escrivaninha",
	"Gaveteiro",
	"Balcão Atendimento",
	"Vitrine Exposição",
	"Gondola Loja",
	"Carrinho Compras",
	"Cesto Lixo",
	"Lixeira Seletiva",
	"Dispenser Papel",
	"Porta Sabonete",
	"Suporte Monitor",
	"Apoio Pés",
	"Luminária Mesa",
	"Ventilador Teto",
	"Aquecedor Ambiente",
	"Umidificador Ar",
	"Purificador Água",
	"Bebedouro Industrial",
	"Cafeteira Elétrica",
	"Micro-ondas Comercial",
	"Geladeira Expositor",
	"Freezer Horizontal",
	"Balança Digital",
	"Impressora Térmica",
	"Scanner Código",
	"Teclado Ergonômico",
	"Mouse Wireless",
	"Headset Profissional",
	"Webcam HD",
	"Hub USB",
];

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(): string {
	const price = randomInt(1999, 99999) / 100;
	return price.toFixed(2);
}

async function seed() {
	console.log("Seeding database...\n");

	const startTime = Date.now();

	// Clear tables
	await db.delete(productRawMaterial);
	await db.delete(rawMaterial);
	await db.delete(product);

	console.log("✓ Tables cleared.\n");

	const rawMaterialsData = RAW_MATERIAL_NAMES.map((name) => ({
		name,
		quantity: randomInt(0, 500),
	}));

	const rawMaterialsId = await db
		.insert(rawMaterial)
		.values(rawMaterialsData)
		.returning({ id: rawMaterial.id, name: rawMaterial.name });

	console.log(`✓ ${rawMaterialsId.length} raw materials inserted.`);

	const productsData = PRODUCT_NAMES.map((name) => ({
		name,
		price: randomPrice(),
	}));

	const productsId = await db
		.insert(product)
		.values(productsData)
		.returning({ id: product.id, name: product.name });

	console.log(`✓ ${productsId.length} products inserted.`);

	const productRawMaterialsData: {
		productId: string;
		rawMaterialId: string;
		quantity: number;
	}[] = [];

	for (const prod of productsId) {
		const numRawMaterials = randomInt(2, 5);
		const shuffledRawMaterials = [...rawMaterialsId].sort(
			() => Math.random() - 0.5,
		);
		const selectedRawMaterials = shuffledRawMaterials.slice(0, numRawMaterials);

		for (const rm of selectedRawMaterials) {
			productRawMaterialsData.push({
				productId: prod.id,
				rawMaterialId: rm.id,
				quantity: randomInt(1, 20),
			});
		}
	}

	await db.insert(productRawMaterial).values(productRawMaterialsData);

	console.log(
		`✓ ${productRawMaterialsData.length} product-raw material relations inserted.`,
	);

	const endTime = Date.now();
	console.log(
		`\n🎉 Seeding completed in ${((endTime - startTime) / 1000).toFixed(2)}s`,
	);
	console.log(`\nSummary:`);
	console.log(`  - Raw Materials: ${rawMaterialsId.length}`);
	console.log(`  - Products: ${productsId.length}`);
	console.log(`  - Relations: ${productRawMaterialsData.length}`);
}

seed()
	.catch((e) => {
		console.error("Error seeding database:", e);
	})
	.finally(() => {
		client.end();
	});
