import { filterAndSort } from "../lib/library";
import type { LibraryQuery, SearchRecord } from "../lib/types";

const form = document.querySelector<HTMLFormElement>("[data-library-controls]");
const grid = document.querySelector<HTMLElement>("[data-paper-grid]");
const resultCount = document.querySelector<HTMLElement>("[data-result-count]");
const emptyState = document.querySelector<HTMLElement>("[data-empty-state]");
const resetButtons = document.querySelectorAll<HTMLButtonElement>("[data-reset-filters]");
const indexElement = document.querySelector<HTMLScriptElement>("#paper-search-index");

if (form && grid && resultCount && emptyState && indexElement) {
  const records = JSON.parse(indexElement.textContent ?? "[]") as SearchRecord[];
  const cards = new Map(
    [...grid.querySelectorAll<HTMLElement>("[data-paper-id]")].map((card) => [card.dataset.paperId ?? "", card]),
  );

  const readQuery = (): LibraryQuery => {
    const data = new FormData(form);
    return {
      query: String(data.get("query") ?? ""),
      task: String(data.get("task") ?? ""),
      year: String(data.get("year") ?? ""),
      status: String(data.get("status") ?? ""),
      evidenceLevel: String(data.get("evidenceLevel") ?? ""),
      sort: String(data.get("sort") ?? "newest") as LibraryQuery["sort"],
    };
  };

  const updateUrl = (query: LibraryQuery) => {
    const url = new URL(window.location.href);
    url.search = "";
    Object.entries(query).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "newest")) url.searchParams.set(key, value);
    });
    window.history.replaceState({}, "", url);
  };

  const render = () => {
    const query = readQuery();
    const visible = filterAndSort(records, query);
    const visibleIds = new Set(visible.map((record) => record.id));

    for (const record of visible) {
      const card = cards.get(record.id);
      if (card) grid.append(card);
    }
    for (const [id, card] of cards) {
      card.hidden = !visibleIds.has(id);
    }

    resultCount.textContent = `显示 ${visible.length} / ${records.length} 篇`;
    emptyState.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
    updateUrl(query);
  };

  const restoreFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params) {
      const field = form.elements.namedItem(key);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = value;
    }
  };

  restoreFromUrl();
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  resetButtons.forEach((button) => button.addEventListener("click", () => {
    form.reset();
    render();
    form.querySelector<HTMLInputElement>("[name='query']")?.focus();
  }));
  render();
}
