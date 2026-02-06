import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "@/env";
import { IndexRoutes } from "./routes";
import { productRoutes } from "./routes/product";
import { rawMaterialRoutes } from "./routes/raw-material";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// CORS configuration
// In production, set CORS_ORIGIN to your frontend URL (e.g., "https://app.example.com")
// Multiple origins can be comma-separated: "https://app.example.com,https://admin.example.com"
const corsOrigins =
	env.CORS_ORIGIN === "*"
		? true // Allow all origins in development
		: env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.register(fastifyCors, {
	origin: corsOrigins,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(IndexRoutes);
app.register(rawMaterialRoutes, { prefix: "/raw" });
app.register(productRoutes, { prefix: "/product" });

app
	.listen({
		port: env.PORT,
		host: "0.0.0.0",
	})
	.then(() => {
		console.log(`Server is running on port ${env.PORT}`);
		console.log(`Environment: ${env.NODE_ENV}`);
		console.log(`CORS origin: ${env.CORS_ORIGIN}`);
	});
