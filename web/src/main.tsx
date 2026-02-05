import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";

const root = document.getElementById("root");

if (!root) {
	console.error("Root element not found");
	throw new Error("Root element not found");
}

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
