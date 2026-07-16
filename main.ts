import { serveDir } from "@std/http/file-server";
import { Store } from "oxigraph";

const graphJson = await Deno.readTextFile("./_site/jsonld/graph.jsonld");
const store = new Store();
store.load(graphJson, {
	format: "application/ld+json",
	base_iri: "https://ll-wiki.marukun712.deno.net/",
});

Deno.serve((req: Request): Response | Promise<Response> => {
	const url = new URL(req.url);

	if (url.pathname === "/sparql" && req.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	}

	if (url.pathname === "/sparql" && req.method === "GET") {
		return handleSparql(url);
	}

	return serveDir(req, { fsRoot: "_site" });
});

function handleSparql(url: URL): Response {
	const query = url.searchParams.get("query");

	if (!query) {
		return new Response(JSON.stringify({ error: "query is required" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}

	try {
		const result = store.query(query);
		if (!Array.isArray(result)) {
			throw new Error("SELECT query expected");
		}
		const bindings = result as Map<
			string,
			{ termType: string; value: string }
		>[];
		const vars = bindings.length > 0 ? [...bindings[0].keys()] : [];

		const typeMap: Record<string, string> = {
			NamedNode: "uri",
			BlankNode: "bnode",
			Literal: "literal",
		};

		const sparqlBindings = bindings.map((binding) => {
			const row: Record<string, { type: string; value: string }> = {};
			for (const v of vars) {
				const term = binding.get(v);
				if (term) {
					row[v] = {
						type: typeMap[term.termType] ?? "literal",
						value: term.value,
					};
				}
			}
			return row;
		});

		return new Response(
			JSON.stringify({ head: { vars }, results: { bindings: sparqlBindings } }),
			{
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			},
		);
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : String(err),
			}),
			{
				status: 400,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			},
		);
	}
}
