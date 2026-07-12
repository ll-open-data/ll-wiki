import { join } from "@std/path";
import { parse as parseYaml } from "@std/yaml";

const VAULT_DIR = "./vault";
const RDF_DIR = "./rdf";

function parseFrontmatter(content: string): Record<string, unknown> | null {
	const parts = content.split("---");
	const result = parseYaml(parts[1].trim());
	if (typeof result !== "object" || result === null) return null;
	return result as Record<string, unknown>;
}

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
	await Deno.mkdir(RDF_DIR, { recursive: true });

	for await (const entry of Deno.readDir(VAULT_DIR)) {
		if (!entry.name.endsWith(".md") || entry.name.startsWith("_")) continue;

		const content = await Deno.readTextFile(join(VAULT_DIR, entry.name));
		const frontmatter = parseFrontmatter(content);
		if (!frontmatter?.["@type"]) continue;

		const body = content.split("---").slice(2).join("---");
		const relations = parseRelations(body);

		const jsonld: Record<string, unknown> = { ...frontmatter };

		for (const { relation, target } of relations) {
			const targetId = `${target}.md`;
			const existing = jsonld[relation];
			if (existing === undefined) {
				jsonld[relation] = { "@id": targetId };
			} else if (Array.isArray(existing)) {
				(existing as Array<unknown>).push({ "@id": targetId });
			} else {
				jsonld[relation] = [existing, { "@id": targetId }];
			}
		}

		const outName = entry.name.replace(".md", ".jsonld");
		const outPath = join(RDF_DIR, outName);
		await Deno.writeTextFile(outPath, JSON.stringify(jsonld, null, 2));
		console.log(`generated: ${outPath}`);
	}
}

main();
