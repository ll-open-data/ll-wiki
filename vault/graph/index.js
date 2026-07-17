const DEFAULT_QUERY = `SELECT ?s ?p ?o WHERE {
  ?s ?p ?o .
  FILTER(isIRI(?o))
  FILTER(?p != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
}`;

async function fetchSparql(query) {
	const res = await fetch(`/sparql?query=${encodeURIComponent(query)}`);
	return res.json();
}

function renderTable(vars, bindings) {
	const result = document.getElementById("result");
	const table = document.createElement("table");
	const thead = document.createElement("thead");
	const headerRow = document.createElement("tr");
	for (const col of vars) {
		const th = document.createElement("th");
		th.textContent = col;
		headerRow.appendChild(th);
	}
	thead.appendChild(headerRow);
	table.appendChild(thead);
	const tbody = document.createElement("tbody");
	for (const row of bindings) {
		const tr = document.createElement("tr");
		for (const col of vars) {
			const td = document.createElement("td");
			td.textContent = row[col]?.value ?? "";
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	result.appendChild(table);
}

async function runQuery() {
	const query = document.getElementById("sparql").value.trim();
	if (!query) return;
	const status = document.getElementById("status");
	const result = document.getElementById("result");
	status.textContent = "実行中...";
	result.innerHTML = "";
	try {
		const json = await fetchSparql(query);
		if (json.error) throw new Error(json.error);
		const vars = json.head.vars;
		const bindings = json.results.bindings;
		if (bindings.length === 0) {
			status.textContent = "結果なし";
			return;
		}
		renderTable(vars, bindings);
		status.textContent = `${bindings.length} 件`;
	} catch (err) {
		status.textContent = `エラー: ${err.message}`;
	}
}

document.getElementById("run").addEventListener("click", runQuery);

document.getElementById("sparql").value = DEFAULT_QUERY;
runQuery();
