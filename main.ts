import { serveDir } from "@std/http/file-server";
import { Store } from "oxigraph";

const graphJson = await Deno.readTextFile("./_site/jsonld/graph.jsonld");
const store = new Store();
store.load(graphJson, {
	format: "application/ld+json",
	base_iri: "https://ll-wiki.local/",
});

Deno.serve((req: Request): Promise<Response> => {
	const url = new URL(req.url);

	if (url.pathname === "/api/sparql" && req.method === "POST") {
		return handleSparql(req);
	}

	return serveDir(req, { fsRoot: "_site" });
});

async function handleSparql(req: Request): Promise<Response> {
	let query: string;

	try {
		const body = await req.json();
		query = body.query;
	} catch {
		return new Response(JSON.stringify({ error: "invalid JSON" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!query) {
		return new Response(JSON.stringify({ error: "query is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const result = store.query(query);
		if (!Array.isArray(result)) {
			throw new Error("SELECT query expected");
		}
		const bindings = result as Map<string, { value: string }>[];
		const vars = bindings.length > 0 ? [...bindings[0].keys()] : [];

		const results = bindings.map((binding) => {
			const row: Record<string, string> = {};
			for (const v of vars) {
				row[v] = binding.get(v)?.value ?? "";
			}
			return row;
		});

		return new Response(JSON.stringify({ vars, results }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : String(err),
			}),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}
}
