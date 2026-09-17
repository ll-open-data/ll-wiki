import {
	select,
	triple,
	uri,
	variable,
} from "https://esm.sh/jsr/@okikio/sparql@0.0.2";

const INSTANCE_BASE = "https://ll-wiki.maril.blue/";

const schema = (name) => uri(`https://schema.org/${name}`);
const ll = (id) => uri(`${INSTANCE_BASE}${id}`);
const v = (name) => variable(name);

const PROPERTIES = {
	Person: [
		{ label: "所属グループ/ユニット", prop: "memberOf" },
		{ label: "アルバム", prop: "album" },
		{ label: "所属学校/事務所", prop: "affiliation" },
		{ label: "担当声優/キャラクター", prop: "relatedTo" },
	],
	Music: [
		{ label: "歌唱アーティスト", prop: "byArtist" },
		{ label: "披露されたイベント", prop: "subjectOf" },
	],
	MusicGroup: [
		{ label: "メンバー", prop: "member" },
		{ label: "アルバム", prop: "album" },
		{ label: "親ユニット", prop: "parentOrganization" },
		{ label: "サブユニット", prop: "subOrganization" },
	],
	MusicEvent: [
		{ label: "演者 (声優)", prop: "actor" },
		{ label: "会場", prop: "location" },
		{ label: "セットリスト", prop: "workPerformed" },
	],
	TVSeries: [
		{ label: "声優", prop: "actor" },
		{ label: "キャラクター", prop: "character" },
		{ label: "ライブイベント", prop: "recordedAt" },
		{ label: "親ユニット", prop: "musicBy" },
	],
	Place: [{ label: "開催イベント", prop: "subjectOf" }],
	Organization: [
		{ label: "所在地", prop: "location" },
		{ label: "メンバー・構成員", prop: "member" },
		{ label: "資金・寄付で支援する人・組織", prop: "funder" },
		{ label: "傘下組織", prop: "subOrganization" },
		{ label: "親組織", prop: "parentOrganization" },
		{ label: "関連する人物・物", prop: "mentions" },
	],
	LocalBusiness: [
		{ label: "所在地", prop: "location" },
		{ label: "従業員・オーナー等", prop: "member" },
		{ label: "関連する人物・物", prop: "mentions" },
	],
	Thing: [{ label: "関連する人物・物", prop: "mentions" }],
	CreativeWork: [
		{ label: "作成者", prop: "author" },
		{ label: "言及している人物・場所・物", prop: "mentions" },
	],
	SoftwareApplication: [{ label: "開発・制作組織", prop: "producer" }],
	Event: [
		{ label: "参加者", prop: "attendee" },
		{ label: "開催場所", prop: "location" },
	],
};

const DEFAULT_QUERY = `SELECT ?s ?p ?o WHERE {
  ?s ?p ?o .
  FILTER(isIRI(?o))
  FILTER(?p != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
}`;

function buildSingleQuery(type, conditions, mode) {
	let q = select([v("s"), v("name")]).where(triple("s", "a", schema(type)));
	if (mode === "or") {
		for (const { prop, value } of conditions) {
			q = q.union(triple("s", schema(prop), ll(value)));
		}
	} else {
		for (const { prop, value } of conditions) {
			q = q.where(triple("s", schema(prop), ll(value)));
		}
	}
	q = q.where(triple("s", schema("name"), v("name")));
	return q.build().value;
}

function buildQueries(type, conditions, mode) {
	if (type === "Music") {
		return [
			{
				type: "MusicRecording",
				query: buildSingleQuery("MusicRecording", conditions, mode),
			},
			{
				type: "MusicAlbum",
				query: buildSingleQuery("MusicAlbum", conditions, mode),
			},
		];
	}
	return [{ type, query: buildSingleQuery(type, conditions, mode) }];
}

function getConditions() {
	return [...document.querySelectorAll(".condition")].map((row) => ({
		prop: row.querySelector(".prop").value,
		value: row.querySelector(".val").value,
	}));
}

function getMode() {
	return document.querySelector('input[name="mode"]:checked').value;
}

function updateSparql() {
	const type = document.getElementById("type").value;
	if (!type) return;
	const conditions = getConditions();
	if (conditions.some((c) => !c.value)) return;
	document.getElementById("sparql").value = buildQueries(
		type,
		conditions,
		getMode(),
	)
		.map((q) => q.query)
		.join("\n\n");
}

async function fetchSparql(query) {
	const res = await fetch(`/sparql?query=${encodeURIComponent(query)}`);
	return res.json();
}

async function fetchValues(type, prop) {
	const types = type === "Music" ? ["MusicRecording", "MusicAlbum"] : [type];
	const all = [];
	for (const t of types) {
		const query = select([v("val"), v("name")])
			.where(triple("s", "a", schema(t)))
			.where(triple("s", schema(prop), v("val")))
			.where(triple("val", schema("name"), v("name")))
			.orderBy("?name")
			.build().value;
		const { results } = await fetchSparql(query);
		for (const binding of results.bindings) {
			all.push({ val: binding.val.value, name: binding.name.value });
		}
	}
	const seen = new Set();
	return all
		.filter((r) => {
			if (seen.has(r.val)) return false;
			seen.add(r.val);
			return true;
		})
		.map((r) => ({
			id: r.val.replace(INSTANCE_BASE, ""),
			name: r.name,
		}));
}

function addConditionRow(type, props) {
	const div = document.createElement("div");
	div.className = "condition";

	const propSel = document.createElement("select");
	propSel.className = "prop";
	for (const { label, prop } of props) {
		const opt = document.createElement("option");
		opt.value = prop;
		opt.textContent = label;
		propSel.appendChild(opt);
	}

	const valSel = document.createElement("select");
	valSel.className = "val";

	const loadValues = async () => {
		valSel.innerHTML = "<option value=''>読み込み中...</option>";
		valSel.disabled = true;
		const values = await fetchValues(type, propSel.value);
		valSel.innerHTML = "<option value=''>-- 選択 --</option>";
		for (const { id, name } of values) {
			const opt = document.createElement("option");
			opt.value = id;
			opt.textContent = name;
			valSel.appendChild(opt);
		}
		valSel.disabled = false;
		updateSparql();
	};

	const del = document.createElement("button");
	del.type = "button";
	del.textContent = "削除";
	del.addEventListener("click", () => {
		div.remove();
		updateSparql();
	});

	propSel.addEventListener("change", loadValues);
	valSel.addEventListener("change", updateSparql);

	div.appendChild(propSel);
	div.appendChild(valSel);
	div.appendChild(del);
	document.getElementById("conditions").appendChild(div);
	loadValues();
}

function pageHref(type, s) {
	const id = s.replace(INSTANCE_BASE, "");
	return `/${type}/${id.split("/").map(encodeURIComponent).join("/")}/`;
}

async function runQueries(items) {
	const status = document.getElementById("status");
	const result = document.getElementById("result");

	status.textContent = "実行中...";
	result.innerHTML = "";

	const requests = items.map((item) =>
		typeof item === "string" ? { type: null, query: item } : item,
	);
	const linkable = requests.every((r) => r.type && r.query.includes("?s"));

	try {
		const allRows = [];
		let vars = [];
		for (const { type, query } of requests) {
			const json = await fetchSparql(query);
			if (json.error) throw new Error(json.error);
			vars = json.head.vars;
			for (const binding of json.results.bindings) {
				const row = {};
				for (const col of vars) {
					row[col] = binding[col]?.value ?? "";
				}
				if (type) row.__type = type;
				allRows.push(row);
			}
		}

		const seen = new Set();
		const deduped = allRows.filter((r) => {
			const key = linkable ? r.s : vars.map((col) => r[col]).join("|");
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		if (deduped.length === 0) {
			status.textContent = "結果なし";
			return;
		}

		const displayCols = linkable ? vars.filter((col) => col !== "s") : vars;

		const table = document.createElement("table");
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		for (const col of displayCols) {
			const th = document.createElement("th");
			th.textContent = col;
			headerRow.appendChild(th);
		}
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement("tbody");
		for (const row of deduped) {
			const tr = document.createElement("tr");
			for (const col of displayCols) {
				const td = document.createElement("td");
				if (linkable && col === "name") {
					const a = document.createElement("a");
					a.href = pageHref(row.__type, row.s);
					a.textContent = row[col] ?? "";
					td.appendChild(a);
				} else {
					td.textContent = row[col] ?? "";
				}
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		result.appendChild(table);
		status.textContent = `${deduped.length} 件`;
	} catch (err) {
		status.textContent = `エラー: ${err.message}`;
	}
}

document.getElementById("type").addEventListener("change", (e) => {
	const type = e.target.value;
	document.getElementById("conditions").innerHTML = "";
	document.getElementById("add").disabled = !type;
	document.getElementById("run").disabled = !type;
	if (type) updateSparql();
});

document.getElementById("add").addEventListener("click", () => {
	const type = document.getElementById("type").value;
	addConditionRow(type, PROPERTIES[type]);
});

document.getElementById("run").addEventListener("click", () => {
	const type = document.getElementById("type").value;
	if (!type) return;
	const conditions = getConditions();
	if (conditions.some((c) => !c.value)) {
		document.getElementById("status").textContent =
			"エラー: 値が選択されていない条件があります";
		return;
	}
	runQueries(buildQueries(type, conditions, getMode()));
});

for (const radio of document.querySelectorAll('input[name="mode"]')) {
	radio.addEventListener("change", updateSparql);
}

document.getElementById("direct-run").addEventListener("click", () => {
	const query = document.getElementById("sparql").value.trim();
	if (query) runQueries([query]);
});

document.getElementById("sparql").value = DEFAULT_QUERY;
