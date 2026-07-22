// BookWalker's attribute list uses CSS-module class names with a build hash
// in the middle (e.g. `attribute-groups-module__2TPMVq__list`). The hash
// changes across rebuilds, so we never hardcode it: only the stable
// filename-derived prefix (`attribute-groups-module__`) and the stable
// author-authored suffix (`__list`, `__listRow`, ...) are relied on, and even
// then only as a starting point — `role="list"` plus an exact per-token
// suffix match is what actually decides the real container, since e.g.
// `__listRow`/`__listValues`/`__listLink` all contain `__list` as a
// substring too.
const CONTAINER_CANDIDATE_SELECTOR = '[role="list"][class*="attribute-groups-module__"]';
const LIST_SUFFIX_RE = /^attribute-groups-module__.+__list$/;
const LISTITEM_SELECTOR = ':scope > [role="listitem"]';

export function findAttributeGroupList(root: ParentNode = document): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(CONTAINER_CANDIDATE_SELECTOR);
  for (const el of candidates) {
    if (Array.from(el.classList).some((token) => LIST_SUFFIX_RE.test(token))) {
      return el;
    }
  }
  return null;
}

export type ClonedRowClasses = {
  row: string;
  label: string;
  value: string;
};

/**
 * Copies class names from an existing row instead of hardcoding them, so the
 * injected row keeps matching the site's own styling even if it changes.
 */
export function cloneRowClasses(container: HTMLElement): ClonedRowClasses | null {
  const existingRow = container.querySelector<HTMLElement>(LISTITEM_SELECTOR);
  if (!existingRow) return null;

  const label = existingRow.children[0] as HTMLElement | undefined;
  const value = existingRow.children[1] as HTMLElement | undefined;
  if (!label || !value) return null;

  return { row: existingRow.className, label: label.className, value: value.className };
}
