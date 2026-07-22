import { gmStyle } from '@makoojs/cli/monkey';
import { findAttributeGroupList, cloneRowClasses } from './dom';
import { fetchGeoblock, formatGeoblock, parseContentId } from './api';
import { hostUrl, autoCheck, settingsOpen } from './settings';
import { LOCATION_CHANGE_EVENT } from './navigation';

const LINK_BUTTON_CSS = `
.bwgstuff-link {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}
`;

function makeLinkButton(text: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bwgstuff-link';
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  return btn;
}

function renderUnconfigured(valueEl: HTMLElement): void {
  valueEl.replaceChildren(
    document.createTextNode('Geo-block check not configured — '),
    makeLinkButton('open settings', () => {
      settingsOpen.value = true;
    }),
  );
}

function renderManual(valueEl: HTMLElement, onCheck: () => void): void {
  valueEl.replaceChildren(makeLinkButton('Check geo-blocking', onCheck));
}

function renderLoading(valueEl: HTMLElement): void {
  valueEl.textContent = 'Checking…';
}

function renderSuccess(valueEl: HTMLElement, text: string): void {
  valueEl.textContent = text;
}

function renderError(valueEl: HTMLElement, onRetry: () => void): void {
  valueEl.replaceChildren(
    document.createTextNode('Unable to check geo-blocking — '),
    makeLinkButton('Retry', onRetry),
  );
}

async function runCheck(contentId: string, valueEl: HTMLElement): Promise<void> {
  renderLoading(valueEl);
  try {
    const data = await fetchGeoblock(hostUrl.value, contentId);
    renderSuccess(valueEl, formatGeoblock(data.geoBlocks));
  } catch (err) {
    console.warn('[bwg-geoblock] check failed:', err);
    renderError(valueEl, () => runCheck(contentId, valueEl));
  }
}

function buildRow(container: HTMLElement): { row: HTMLElement; valueEl: HTMLElement } {
  const classes = cloneRowClasses(container);

  const row = document.createElement('div');
  row.className = classes?.row ?? '';
  row.setAttribute('role', 'listitem');
  row.setAttribute('data-bwgstuff-attached', 'geoblock');

  const label = document.createElement('p');
  label.style.color = 'var(--color-text-secondary)';
  label.className = classes?.label ?? '';
  label.textContent = 'GEO-BLOCKING';

  const value = document.createElement('p');
  value.className = classes?.value ?? '';

  row.append(label, value);
  return { row, valueEl: value };
}

/**
 * Starts a single, persistent sync loop for the geo-block row. There is no
 * Makoo/Vue component lifecycle here on purpose: a MutationObserver watching
 * the whole document plus a navigation listener both funnel into the same
 * idempotent `sync()`, which decides on every call whether the currently
 * mounted row (if any) is still correctly attached for the current page's
 * content id, and rebuilds it from scratch otherwise. This uniformly
 * handles every failure mode we've hit in practice: the row being wiped by
 * a same-page React re-render, a client-side navigation reusing the same
 * container element with new content, and the container being replaced
 * outright.
 */
export function startGeoblockInjector(): void {
  gmStyle.add(LINK_BUTTON_CSS);

  let mountedRow: HTMLElement | null = null;
  let mountedContentId: string | null = null;

  function teardownRow(): void {
    mountedRow?.remove();
    mountedRow = null;
    mountedContentId = null;
  }

  function sync(): void {
    const contentId = parseContentId(location.pathname);

    if (!contentId) {
      teardownRow();
      return;
    }

    const container = findAttributeGroupList();
    if (!container) {
      // Target isn't on the page yet (or this page never gets one) —
      // leave things as-is, the observer will call sync() again on the
      // next relevant DOM change.
      return;
    }

    const alreadyCorrect =
      mountedRow &&
      mountedRow.isConnected &&
      mountedContentId === contentId &&
      container.contains(mountedRow);
    if (alreadyCorrect) return;

    teardownRow();
    const { row, valueEl } = buildRow(container);
    container.appendChild(row);
    mountedRow = row;
    mountedContentId = contentId;

    if (!hostUrl.value) {
      renderUnconfigured(valueEl);
    } else if (!autoCheck.value) {
      renderManual(valueEl, () => runCheck(contentId, valueEl));
    } else {
      runCheck(contentId, valueEl);
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleSync(): void {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      sync();
    }, 50);
  }

  // The script runs at document-start (see vite.config.ts) so the history
  // patch installs before the site's own router can capture a reference to
  // the original functions — but that means document.body doesn't exist
  // yet at this exact point. Defer only the DOM-dependent observer/initial
  // sync until it does; everything else (listeners on window) is safe now.
  function startObserving(): void {
    new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
    sync();
  }

  if (document.body) {
    startObserving();
  } else {
    document.addEventListener('DOMContentLoaded', startObserving, { once: true });
  }

  window.addEventListener(LOCATION_CHANGE_EVENT, scheduleSync);

  // A settings change should refresh an already-rendered row immediately,
  // without waiting for a navigation or DOM mutation to trigger a resync.
  hostUrl.subscribe(() => {
    teardownRow();
    scheduleSync();
  });
  autoCheck.subscribe(() => {
    teardownRow();
    scheduleSync();
  });
}
