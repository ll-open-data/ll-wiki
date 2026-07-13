import Validator from "@adobe/structured-data-validator";

const OUT_DIR = "./vault/jsonld";

type JsonLdNode = {
	"@type"?: string | string[];
	"@graph"?: JsonLdNode[];
	[key: string]: unknown;
};
type JsonLdData = JsonLdNode | JsonLdNode[];

const schemaRes = await fetch(
	"https://schema.org/version/latest/schemaorg-all-https.jsonld",
);
const schemaOrgJson = await schemaRes.json();
const validator = new Validator(schemaOrgJson);

function extractNodes(data: JsonLdData): JsonLdNode[] {
	if (Array.isArray(data)) return data.flatMap(extractNodes);
	if (data?.["@graph"]) return data["@graph"].flatMap(extractNodes);
	return data ? [data] : [];
}

function groupByType(nodes: JsonLdNode[]): Record<string, JsonLdNode[]> {
	const g: Record<string, JsonLdNode[]> = {};
	for (const n of nodes) {
		const types = n["@type"] ?? "Thing";
		for (const t of Array.isArray(types) ? types : [types]) {
			if (!g[t]) g[t] = [];
			g[t].push(n);
		}
	}
	return g;
}

let hasError = false;

for await (const entry of Deno.readDir(OUT_DIR)) {
	if (!entry.isFile) continue;
	if (!entry.name.endsWith(".json") && !entry.name.endsWith(".jsonld")) {
		continue;
	}

	const raw = await Deno.readTextFile(`${OUT_DIR}/${entry.name}`);
	const jsonld = groupByType(extractNodes(JSON.parse(raw) as JsonLdData));
	const results = await validator.validate({
		jsonld,
		microdata: {},
		rdfa: {},
		metatags: {},
	});

	for (const issue of results) {
		console.log(`${entry.name}: [${issue.severity}] ${issue.issueMessage}`);
		if (issue.severity === "ERROR") hasError = true;
	}
}

if (hasError) Deno.exit(1);
