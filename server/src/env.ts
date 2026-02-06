import z from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	CORS_ORIGIN: z.string().default("*"),
	PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
