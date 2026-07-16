import { serveDir } from "@std/http/file-server";
import { Store } from "oxigraph";

const graphJson = await Deno.readTextFile("./_site/jsonld/graph.jsonld");
const store = new Store();
store.load(graphJson, {
	format: "application/ld+json",
	base_iri: "https://ll-wiki.marukun712.deno.net/",
});

// https://docs.deno.com/examples/http_server_cors/
function corsHeaders(): Headers {
	const headers = new Headers();
	headers.set("access-control-allow-origin", "*");
	return headers;
}

Deno.serve((req: Request): Response | Promise<Response> => {
	const url = new URL(req.url);

	if (url.pathname === "/sparql" && req.method === "OPTIONS") {
		const headers = corsHeaders();
		headers.set("access-control-allow-methods", "GET");
		headers.set("access-control-allow-headers", "content-type");
		headers.set("access-control-max-age", "86400");
		return new Response(null, { status: 204, headers });
	}

	if (url.pathname === "/sparql" && req.method === "GET") {
		return handleSparql(url);
	}

	return serveDir(req, { fsRoot: "_site" });
});

function handleSparql(url: URL): Response {
	const query = url.searchParams.get("query");

	if (!query) {
		const headers = corsHeaders();
		headers.set("content-type", "application/json");
		return new Response(JSON.stringify({ error: "query is required" }), {
			status: 400,
			headers,
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

		const headers = corsHeaders();
		headers.set("content-type", "application/json");
		return new Response(
			JSON.stringify({ head: { vars }, results: { bindings: sparqlBindings } }),
			{ headers },
		);
	} catch (err) {
		const headers = corsHeaders();
		headers.set("content-type", "application/json");
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : String(err),
			}),
			{ status: 400, headers },
		);
	}
}
