import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const IndexRoutes: FastifyPluginAsyncZod = async (app) => {
	app.get("/", async (request, reply) => {
		return { message: "Welcome to the Product Stock API" };
	});
};
