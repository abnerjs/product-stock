import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { createRawMaterial } from "@/services/raw-material/create";
import { deleteRawMaterial } from "@/services/raw-material/delete";
import {
	getAllRawMaterials,
	getRawMaterialById,
} from "@/services/raw-material/get";
import { updateRawMaterial } from "@/services/raw-material/update";

// Zod Schemas
const rawMaterialSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	quantity: z.number().int(),
	productsCount: z.number().int(),
});

const paginationSchema = z.object({
	page: z.number().int(),
	limit: z.number().int(),
	total: z.number().int(),
	totalPages: z.number().int(),
});

const createRawMaterialSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	quantity: z.number().int().min(0, "Quantidade deve ser maior ou igual a 0"),
});

const updateRawMaterialSchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").optional(),
	quantity: z
		.number()
		.int()
		.min(0, "Quantidade deve ser maior ou igual a 0")
		.optional(),
});

const queryParamsSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	orderBy: z.enum(["name", "quantity"]).default("name"),
	order: z.enum(["asc", "desc"]).default("asc"),
});

export const rawMaterialRoutes: FastifyPluginAsyncZod = async (app) => {
	// Get all raw materials with pagination and filtering
	app.get(
		"/",
		{
			schema: {
				querystring: queryParamsSchema,
				response: {
					200: z.object({
						data: z.array(rawMaterialSchema),
						pagination: paginationSchema,
					}),
				},
			},
		},
		async (request, _reply) => {
			const { search, page, limit, orderBy, order } = request.query;
			const result = await getAllRawMaterials({
				search,
				page,
				limit,
				orderBy,
				order,
			});
			return result;
		},
	);

	// Get raw material by ID
	app.get(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				response: {
					200: z.object({
						id: z.uuid(),
						name: z.string(),
						quantity: z.number().int(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const rawMaterialData = await getRawMaterialById(id);

			if (!rawMaterialData) {
				return reply
					.status(404)
					.send({ message: "Matéria-prima não encontrada" });
			}

			return rawMaterialData;
		},
	);

	// Create raw material
	app.post(
		"/",
		{
			schema: {
				body: createRawMaterialSchema,
				response: {
					201: z.object({
						id: z.uuid(),
						name: z.string(),
						quantity: z.number().int(),
					}),
					400: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { name, quantity } = request.body;

			const newRawMaterial = await createRawMaterial({ name, quantity });

			return reply.status(201).send(newRawMaterial);
		},
	);

	// Update raw material
	app.put(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				body: updateRawMaterialSchema,
				response: {
					200: z.object({
						id: z.uuid(),
						name: z.string(),
						quantity: z.number().int(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const { name, quantity } = request.body;

			const existingRawMaterial = await getRawMaterialById(id);
			if (!existingRawMaterial) {
				return reply
					.status(404)
					.send({ message: "Matéria-prima não encontrada" });
			}

			const updatedRawMaterial = await updateRawMaterial({
				id,
				name,
				quantity,
			});

			return updatedRawMaterial;
		},
	);

	// Delete raw material
	app.delete(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				response: {
					200: z.object({
						id: z.uuid(),
						name: z.string(),
						quantity: z.number().int(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const existingRawMaterial = await getRawMaterialById(id);
			if (!existingRawMaterial) {
				return reply
					.status(404)
					.send({ message: "Matéria-prima não encontrada" });
			}

			const deletedRawMaterial = await deleteRawMaterial(id);

			return deletedRawMaterial;
		},
	);
};
