import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { createProduct } from "@/services/product/create";
import { deleteProduct } from "@/services/product/delete";
import { getAllProducts, getProductById } from "@/services/product/get";
import { getProductionSummary } from "@/services/product/summary";
import { updateProduct } from "@/services/product/update";

// Zod Schemas
const rawMaterialInputSchema = z.object({
	rawMaterialId: z.string().uuid(),
	quantity: z.number().int().min(1, "Quantidade deve ser maior que 0"),
});

const productRawMaterialSchema = z.object({
	id: z.string().uuid(),
	rawMaterialId: z.string().uuid(),
	rawMaterialName: z.string(),
	rawMaterialQuantityInStock: z.number().int(),
	quantity: z.number().int(),
});

const productSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	rawMaterialsCount: z.number().int(),
});

const productWithRawMaterialsSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	rawMaterials: z.array(productRawMaterialSchema),
});

const paginationSchema = z.object({
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
	totalPages: z.number().int(),
});

const createProductSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	price: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/, "Preço deve ser um número válido"),
	rawMaterials: z.array(rawMaterialInputSchema).optional(),
});

const updateProductSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").optional(),
	price: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/, "Preço deve ser um número válido")
		.optional(),
	rawMaterials: z.array(rawMaterialInputSchema).optional(),
});

const queryParamsSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	orderBy: z.enum(["name", "price"]).default("name"),
	order: z.enum(["asc", "desc"]).default("asc"),
});

const summaryQueryParamsSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	filter: z.enum(["all", "producible", "not-producible"]).default("all"),
});

const summaryRawMaterialSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	required: z.number().int(),
	inStock: z.number().int(),
});

const productSummarySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	maxProducible: z.number().int(),
	canProduce: z.boolean(),
	rawMaterials: z.array(summaryRawMaterialSchema),
});

export const productRoutes: FastifyPluginAsyncZod = async (app) => {
	// Get production summary
	app.get(
		"/summary",
		{
			schema: {
				querystring: summaryQueryParamsSchema,
				response: {
					200: z.object({
						data: z.array(productSummarySchema),
						pagination: paginationSchema,
					}),
				},
			},
		},
		async (request, _reply) => {
			const { search, page, limit, filter } = request.query;
			const result = await getProductionSummary({
				search,
				page,
				limit,
				filter,
			});
			return result;
		},
	);

	// Get all products with pagination and filtering
	app.get(
		"/",
		{
			schema: {
				querystring: queryParamsSchema,
				response: {
					200: z.object({
						data: z.array(productSchema),
						pagination: paginationSchema,
					}),
				},
			},
		},
		async (request, _reply) => {
			const { search, page, limit, orderBy, order } = request.query;
			const result = await getAllProducts({
				search,
				page,
				limit,
				orderBy,
				order,
			});
			return result;
		},
	);

	// Get product by ID with raw materials
	app.get(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.string().uuid(),
				}),
				response: {
					200: productWithRawMaterialsSchema,
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const productData = await getProductById(id);

			if (!productData) {
				return reply.status(404).send({ message: "Produto não encontrado" });
			}

			return productData;
		},
	);

	// Create product
	app.post(
		"/",
		{
			schema: {
				body: createProductSchema,
				response: {
					201: z.object({
						id: z.string().uuid(),
						name: z.string(),
						price: z.string(),
					}),
					400: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { name, price, rawMaterials } = request.body;

			const newProduct = await createProduct({ name, price, rawMaterials });

			return reply.status(201).send(newProduct);
		},
	);

	// Update product
	app.put(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.string().uuid(),
				}),
				body: updateProductSchema,
				response: {
					200: z.object({
						id: z.string().uuid(),
						name: z.string(),
						price: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const { name, price, rawMaterials } = request.body;

			const existingProduct = await getProductById(id);
			if (!existingProduct) {
				return reply.status(404).send({ message: "Produto não encontrado" });
			}

			const updatedProduct = await updateProduct({
				id,
				name,
				price,
				rawMaterials,
			});

			return updatedProduct;
		},
	);

	// Delete product
	app.delete(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.string().uuid(),
				}),
				response: {
					200: z.object({
						id: z.string().uuid(),
						name: z.string(),
						price: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const existingProduct = await getProductById(id);
			if (!existingProduct) {
				return reply.status(404).send({ message: "Produto não encontrado" });
			}

			const deletedProduct = await deleteProduct(id);

			return deletedProduct;
		},
	);
};
