import { extract } from "@std/front-matter/yaml";
import { join } from "@std/path";

const VAULT_DIR = "./vault";
const OUT_FILE = "./vault/jsonld/graph.jsonld";

function parseRelations(
	body: string,
): Array<{ relation: string; target: string }> {
	const relations: Array<{ relation: string; target: string }> = [];
	for (const chunk of body.split("[[").slice(1)) {
		const [target, rest] = chunk.split("]]");
		if (!rest?.startsWith("(")) continue;
		const relation = rest.slice(1, rest.indexOf(")"));
		relations.push({ target, relation });
	}
	return relations;
}

async function* walkMd(dir: string): AsyncGenerator<string> {
	for await (const entry of Deno.readDir(dir)) {
		const path = join(dir, entry.name);
		if (
			entry.isDirectory &&
			!entry.name.startsWith("_") &&
			entry.name !== "jsonld"
		) {
			yield* walkMd(path);
		} else if (
			entry.isFile &&
			entry.name.endsWith(".md") &&
			!entry.name.startsWith("_")
		) {
			yield path;
		}
	}
}

async function main() {
	await Deno.mkdir("./vault/jsonld", { recursive: true });

	const graph: Record<string, unknown>[] = [];

	for await (const filePath of walkMd(VAULT_DIR)) {
		const content = await Deno.readTextFile(filePath);
		const { attrs, body } = extract<Record<string, unknown>>(content);
		if (!attrs["@type"]) continue;

		const relations = parseRelations(body);
		const { "@context": _ctx, ...node } = attrs as Record<string, unknown>;

		for (const { relation, target } of relations) {
			const existing = node[relation];
			if (existing === undefined) {
				node[relation] = { "@id": target };
			} else if (Array.isArray(existing)) {
				(existing as unknown[]).push({ "@id": target });
			} else {
				node[relation] = [existing, { "@id": target }];
			}
		}

		graph.push(node);
	}

	const output = {
		"@context": {
			"@vocab": "https://schema.org/",
			"@base": "https://ll-wiki.local/",
		},
		"@graph": graph,
	};

	await Deno.writeTextFile(OUT_FILE, JSON.stringify(output, null, 2));
	console.log(`generated: ${OUT_FILE} (${graph.length} nodes)`);
}

main();
