import lume from "lume/mod.ts";
import references from "lume_markdown_plugins/references.ts";
import wikilinks from "lume_markdown_plugins/wikilinks.ts";

const site = lume({ src: "./vault" });

site.preprocess([".md"], (pages) => {
	for (const page of pages) {
		const content = page.data.content as string;
		if (!content) continue;

		page.data.references = content
			.split("[[")
			.slice(1)
			.map((part) => {
				const name = part.split("]]")[0].trim();
				return name.endsWith(".md") ? name.slice(0, -3) : name;
			})
			.map((name) => pages.find((p) => p.data.basename === name)?.data.url)
			.filter((url) => url != null);
	}
});

site.use(wikilinks());
site.use(references());

// Search and replace the wikilinks with the final URLs
site.process([".html"], (pages) => {
	for (const page of pages) {
		// Search all wikilinks in the page
		for (const link of page.document.querySelectorAll("a[data-wikilink]")) {
			// Get the link id and remove the attribute
			const id = link.getAttribute("data-wikilink");
			link.removeAttribute("data-wikilink");

			// Search a page with this id
			const found = pages.find(
				(p) => p.data.basename === decodeURIComponent(id ?? ""),
			);

			if (found) {
				link.setAttribute("href", found.data.url);
			} else {
				link.setAttribute("title", "This page does not exist");
				link.classList.add("broken-link");
			}
		}
	}
});

export default site;
