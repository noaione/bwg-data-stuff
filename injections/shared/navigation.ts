// Next.js client-side routing changes the URL via the History API without a
// full page reload, so there's no natural "page changed" signal to listen
// for. This patches history.pushState/replaceState exactly once (called from
// injections/setup.ts, which only runs once per script execution) and
// broadcasts a shared event that any module can listen for.
export const LOCATION_CHANGE_EVENT = 'bwgstuff:locationchange';

let installed = false;

export function installNavigationWatcher(): void {
  if (installed) return;
  installed = true;

  const rawPushState = history.pushState.bind(history);
  const rawReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<History['pushState']>) {
    const result = rawPushState(...args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    return result;
  };
  history.replaceState = function (...args: Parameters<History['replaceState']>) {
    const result = rawReplaceState(...args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    return result;
  };
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  });

  // Belt-and-suspenders: the patch above only catches calls that actually go
  // through window.history.pushState/replaceState at the time we patched
  // it. If the site's router captured its own reference to the originals
  // before this ran (or otherwise bypasses them), this poll still notices
  // the URL changed regardless of how it changed.
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    }
  }, 500);
}
