import { extract } from "@std/front-matter/yaml";
import { join } from "@std/path";

const VAULT_DIR = "./vault";
const OUT_DIR = "./vault/jsonld";

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

async function main() {
	await Deno.mkdir(OUT_DIR, { recursive: true });

	for await (const entry of Deno.readDir(VAULT_DIR)) {
		if (!entry.name.endsWith(".md") || entry.name.startsWith("_")) continue;

		const content = await Deno.readTextFile(join(VAULT_DIR, entry.name));
		const { attrs, body } = extract<Record<string, unknown>>(content);
		if (!attrs["@type"]) continue;

		const relations = parseRelations(body);
		const jsonld: Record<string, unknown> = { ...attrs };

		for (const { relation, target } of relations) {
			const existing = jsonld[relation];
			if (existing === undefined) {
				jsonld[relation] = { "@id": target };
			} else if (Array.isArray(existing)) {
				existing.push({ "@id": target });
			} else {
				jsonld[relation] = [existing, { "@id": target }];
			}
		}

		const outName = entry.name.replace(".md", ".jsonld");
		const outPath = join(OUT_DIR, outName);
		await Deno.writeTextFile(outPath, JSON.stringify(jsonld, null, 2));
		console.log(`generated: ${outPath}`);
	}
}

main();
