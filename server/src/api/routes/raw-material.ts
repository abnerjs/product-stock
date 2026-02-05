import {
	getAllRawMaterials,
	getRawMaterialById,
} from "@/services/raw-material/get";

export const rawMaterialRoutes = async (app: any) => {
	// All raw materials
	app.get("/", async (request: any, reply: any) => {
		const rawMaterials = await getAllRawMaterials();

		return { rawMaterials };
	});

	// Get raw material by ID
	app.get("/:id", async (request: any, reply: any) => {
		const { id } = request.params;
		const rawMaterials = await getRawMaterialById(id);

		return { rawMaterials };
	});
};
