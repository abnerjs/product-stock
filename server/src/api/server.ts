import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { IndexRoutes } from "./routes";
import { productRoutes } from "./routes/product";
import { rawMaterialRoutes } from "./routes/raw-material";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE"],
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(IndexRoutes);
app.register(rawMaterialRoutes, { prefix: "/raw" });
app.register(productRoutes, { prefix: "/product" });

const PORT = Number(process.env.PORT) || 3333;

app
	.listen({
		port: PORT,
		host: "0.0.0.0",
	})
	.then(() => {
		console.log(`Server is running on port ${PORT}`);
	});
