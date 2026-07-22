// ==UserScript==
// @name       bwg-data-stuff
// @namespace  noaione/bwg-data-stuff
// @version    0.1.0
// @license    MIT
// @icon       https://vitejs.dev/logo.svg
// @match      https://bookwalker.com/*
// @match      https://www.bookwalker.com/*
// @require    https://cdn.jsdelivr.net/npm/vue@3.5.40/dist/vue.global.min.js
// @grant      GM_addElement
// @grant      GM_addStyle
// @grant      GM_addValueChangeListener
// @grant      GM_deleteValue
// @grant      GM_deleteValues
// @grant      GM_getValue
// @grant      GM_getValues
// @grant      GM_listValues
// @grant      GM_registerMenuCommand
// @grant      GM_removeValueChangeListener
// @grant      GM_setValue
// @grant      GM_setValues
// @grant      GM_unregisterMenuCommand
// @grant      GM_xmlhttpRequest
// @run-at     document-start
// ==/UserScript==

(function(vue) {
var d$1 = new Set();
	var _virtual_monkey_css_side_effects_default = async (e) => {
		d$1.has(e) || (d$1.add(e), ((t) => {
			typeof GM_addStyle == "function" ? GM_addStyle(t) : (document.head || document.documentElement).appendChild(document.createElement("style")).append(t);
		})(e));
	};

_virtual_monkey_css_side_effects_default(` .bwgstuff-overlay[data-v-163674e9]{z-index:999999;background:#00000080;justify-content:center;align-items:center;font-family:system-ui,sans-serif;display:flex;position:fixed;inset:0}.bwgstuff-modal[data-v-163674e9]{color:#1a1a1a;background:#fff;border-radius:12px;gap:1rem;width:min(420px,100vw - 32px);padding:1.5rem;display:grid;box-shadow:0 20px 45px #00000040}.bwgstuff-modal h2[data-v-163674e9]{margin:0;font-size:1.1rem}.bwgstuff-field[data-v-163674e9],.bwgstuff-checkbox[data-v-163674e9]{gap:.35rem;font-size:.9rem;display:grid}.bwgstuff-checkbox[data-v-163674e9]{grid-auto-flow:column;justify-content:start;align-items:center;gap:.5rem}.bwgstuff-field input[type=text][data-v-163674e9]{font:inherit;border:1px solid #ccc;border-radius:6px;padding:.5rem .6rem}.bwgstuff-actions[data-v-163674e9]{justify-content:flex-end;gap:.5rem;margin-top:.25rem;display:flex}.bwgstuff-btn[data-v-163674e9]{color:#fff;font:inherit;cursor:pointer;background:#2563eb;border:none;border-radius:6px;padding:.5rem 1rem}.bwgstuff-btn--ghost[data-v-163674e9]{color:#1a1a1a;background:0 0;border:1px solid #ccc}
/*$vite$:1*/ `);

var _GM_addElement = (() => typeof GM_addElement != "undefined" ? GM_addElement : void 0)();
	var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
	var _GM_addValueChangeListener = (() => typeof GM_addValueChangeListener != "undefined" ? GM_addValueChangeListener : void 0)();
	var _GM_deleteValue = (() => typeof GM_deleteValue != "undefined" ? GM_deleteValue : void 0)();
	var _GM_deleteValues = (() => typeof GM_deleteValues != "undefined" ? GM_deleteValues : void 0)();
	var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
	var _GM_getValues = (() => typeof GM_getValues != "undefined" ? GM_getValues : void 0)();
	var _GM_listValues = (() => typeof GM_listValues != "undefined" ? GM_listValues : void 0)();
	var _GM_registerMenuCommand = (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
	var _GM_removeValueChangeListener = (() => typeof GM_removeValueChangeListener != "undefined" ? GM_removeValueChangeListener : void 0)();
	var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
	var _GM_setValues = (() => typeof GM_setValues != "undefined" ? GM_setValues : void 0)();
	var _GM_unregisterMenuCommand = (() => typeof GM_unregisterMenuCommand != "undefined" ? GM_unregisterMenuCommand : void 0)();
	var _GM_xmlhttpRequest = (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
	var N$1 = {
		register: _GM_registerMenuCommand,
		unregister: _GM_unregisterMenuCommand
	};
	var F$1 = {
		send: _GM_xmlhttpRequest,
		get(e, t) {
			return _GM_xmlhttpRequest({
				...t ?? {},
				url: e,
				method: "GET"
			});
		},
		post(e, t) {
			return _GM_xmlhttpRequest({
				...t ?? {},
				url: e,
				method: "POST"
			});
		}
	};
	var L$1 = {
		get: _GM_getValue,
		getMany: _GM_getValues,
		set: _GM_setValue,
		setMany: _GM_setValues,
		remove: _GM_deleteValue,
		removeMany: _GM_deleteValues,
		keys: _GM_listValues,
		watch: _GM_addValueChangeListener,
		unwatch: _GM_removeValueChangeListener
	};
	var R$1 = {
		add: _GM_addStyle,
		element: _GM_addElement
	};
	var Store = class {
		current;
		listeners = new Set();
		constructor(current) {
			this.current = current;
		}
		get value() {
			return this.current;
		}
		set value(next) {
			this.current = next;
			for (const listener of this.listeners) listener(next);
		}
		subscribe(listener) {
			this.listeners.add(listener);
			return () => this.listeners.delete(listener);
		}
	};
	var hostUrl = new Store(L$1.get("hostUrl", "https://bwg-data-api.serik.at"));
	var autoCheck = new Store(L$1.get("autoCheck", true));
	var settingsOpen = new Store(false);
	hostUrl.subscribe((value) => L$1.set("hostUrl", value));
	autoCheck.subscribe((value) => L$1.set("autoCheck", value));
	var LOCATION_CHANGE_EVENT = "bwgstuff:locationchange";
	var installed = false;
	function installNavigationWatcher() {
		if (installed) return;
		installed = true;
		const rawPushState = history.pushState.bind(history);
		const rawReplaceState = history.replaceState.bind(history);
		history.pushState = function(...args) {
			const result = rawPushState(...args);
			window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
			return result;
		};
		history.replaceState = function(...args) {
			const result = rawReplaceState(...args);
			window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
			return result;
		};
		window.addEventListener("popstate", () => {
			window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
		});
		let lastHref = location.href;
		setInterval(() => {
			if (location.href !== lastHref) {
				lastHref = location.href;
				window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
			}
		}, 500);
	}
	var CONTAINER_CANDIDATE_SELECTOR = "[role=\"list\"][class*=\"attribute-groups-module__\"]";
	var LIST_SUFFIX_RE = /^attribute-groups-module__.+__list$/;
	var LISTITEM_SELECTOR = ":scope > [role=\"listitem\"]";
	function findAttributeGroupList(root = document) {
		const candidates = root.querySelectorAll(CONTAINER_CANDIDATE_SELECTOR);
		for (const el of candidates) if (Array.from(el.classList).some((token) => LIST_SUFFIX_RE.test(token))) return el;
		return null;
	}
function cloneRowClasses(container) {
		const existingRow = container.querySelector(LISTITEM_SELECTOR);
		if (!existingRow) return null;
		const label = existingRow.children[0];
		const value = existingRow.children[1];
		if (!label || !value) return null;
		return {
			row: existingRow.className,
			label: label.className,
			value: value.className
		};
	}
	function parseContentId(pathname) {
		const m = pathname.match(/^\/(volume|chapter)\/([A-Za-z0-9]+)(?:\/|$)/);
		return m ? m[2] : null;
	}
	function fetchGeoblock(host, contentId) {
		const url = `${host.replace(/\/$/, "")}/api/geoblocks/${encodeURIComponent(contentId)}?normalize=true`;
		return new Promise((resolve, reject) => {
			F$1.get(url, {
				timeout: 1e4,
				onload: (res) => {
					if (res.status >= 200 && res.status < 300) try {
						resolve(JSON.parse(res.responseText));
					} catch {
						reject( new Error("invalid response"));
					}
					else reject( new Error(`HTTP ${res.status}`));
				},
				onerror: () => reject( new Error("network error")),
				ontimeout: () => reject( new Error("timeout"))
			});
		});
	}
	function getGeoblockLines(gb) {
		const lines = [];
		if (gb.global) lines.push({
			label: "",
			text: "Available worldwide"
		});
		else if (gb.allowed.length > 0) lines.push({
			label: "Allowed",
			text: gb.allowed.join(", ")
		});
		if (gb.blocked.length > 0) lines.push({
			label: "Blocked",
			text: gb.blocked.join(", ")
		});
		if (lines.length === 0) lines.push({
			label: "",
			text: "No geo-block data available"
		});
		return lines;
	}
	var LINK_BUTTON_CSS = `
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
	function makeLinkButton(text, onClick) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "bwgstuff-link";
		btn.textContent = text;
		btn.addEventListener("click", onClick);
		return btn;
	}
	function renderUnconfigured(valueEl) {
		valueEl.replaceChildren(document.createTextNode("Geo-block check not configured — "), makeLinkButton("open settings", () => {
			settingsOpen.value = true;
		}));
	}
	function renderManual(valueEl, onCheck) {
		valueEl.replaceChildren(makeLinkButton("Check geo-blocking", onCheck));
	}
	function renderLoading(valueEl) {
		valueEl.textContent = "Checking…";
	}
	function renderSuccess(valueEl, gb) {
		const lines = getGeoblockLines(gb);
		const nodes = [];
		lines.forEach((line, index) => {
			if (index > 0) {
				nodes.push(document.createElement("br"));
				nodes.push(document.createElement("br"));
			}
			if (line.label) {
				const strong = document.createElement("strong");
				strong.textContent = `${line.label}: `;
				nodes.push(strong);
			}
			nodes.push(document.createTextNode(line.text));
		});
		valueEl.replaceChildren(...nodes);
	}
	function renderError(valueEl, onRetry) {
		valueEl.replaceChildren(document.createTextNode("Unable to check geo-blocking — "), makeLinkButton("Retry", onRetry));
	}
	async function runCheck(contentId, valueEl) {
		renderLoading(valueEl);
		try {
			renderSuccess(valueEl, (await fetchGeoblock(hostUrl.value, contentId)).geoBlocks);
		} catch (err) {
			console.warn("[bwg-geoblock] check failed:", err);
			renderError(valueEl, () => runCheck(contentId, valueEl));
		}
	}
	function buildRow(container) {
		const classes = cloneRowClasses(container);
		const row = document.createElement("div");
		row.className = classes?.row ?? "";
		row.setAttribute("role", "listitem");
		row.setAttribute("data-bwgstuff-attached", "geoblock");
		const label = document.createElement("p");
		label.style.color = "var(--color-text-secondary)";
		label.className = classes?.label ?? "";
		label.textContent = "GEO-BLOCKING";
		const value = document.createElement("p");
		value.className = classes?.value ?? "";
		row.append(label, value);
		return {
			row,
			valueEl: value
		};
	}
function startGeoblockInjector() {
		R$1.add(LINK_BUTTON_CSS);
		let mountedRow = null;
		let mountedContentId = null;
		function teardownRow() {
			mountedRow?.remove();
			mountedRow = null;
			mountedContentId = null;
		}
		function sync() {
			const contentId = parseContentId(location.pathname);
			if (!contentId) {
				teardownRow();
				return;
			}
			const container = findAttributeGroupList();
			if (!container) return;
			if (mountedRow && mountedRow.isConnected && mountedContentId === contentId && container.contains(mountedRow)) return;
			teardownRow();
			const { row, valueEl } = buildRow(container);
			container.appendChild(row);
			mountedRow = row;
			mountedContentId = contentId;
			if (!hostUrl.value) renderUnconfigured(valueEl);
			else if (!autoCheck.value) renderManual(valueEl, () => runCheck(contentId, valueEl));
			else runCheck(contentId, valueEl);
		}
		let debounceTimer;
		function scheduleSync() {
			if (debounceTimer) return;
			debounceTimer = setTimeout(() => {
				debounceTimer = void 0;
				sync();
			}, 50);
		}
		function startObserving() {
			new MutationObserver(scheduleSync).observe(document.body, {
				childList: true,
				subtree: true
			});
			sync();
		}
		if (document.body) startObserving();
		else document.addEventListener("DOMContentLoaded", startObserving, { once: true });
		window.addEventListener(LOCATION_CHANGE_EVENT, scheduleSync);
		hostUrl.subscribe(() => {
			teardownRow();
			scheduleSync();
		});
		autoCheck.subscribe(() => {
			teardownRow();
			scheduleSync();
		});
	}
	N$1.register("BWG Settings", () => {
		settingsOpen.value = true;
	});
	installNavigationWatcher();
	startGeoblockInjector();
	var _hoisted_1 = { class: "bwgstuff-modal" };
	var _hoisted_2 = { class: "bwgstuff-field" };
	var _hoisted_3 = { class: "bwgstuff-checkbox" };
	var app_vue_vue_type_script_setup_true_lang_default = (0, vue.defineComponent)({
		__name: "app",
		setup(__props) {
			const isOpen = (0, vue.ref)(settingsOpen.value);
			const draftHostUrl = (0, vue.ref)(hostUrl.value);
			const draftAutoCheck = (0, vue.ref)(autoCheck.value);
			let unsubscribe;
			(0, vue.onMounted)(() => {
				unsubscribe = settingsOpen.subscribe((open) => {
					isOpen.value = open;
					if (open) {
						draftHostUrl.value = hostUrl.value;
						draftAutoCheck.value = autoCheck.value;
					}
				});
			});
			(0, vue.onBeforeUnmount)(() => {
				unsubscribe?.();
			});
			function save() {
				hostUrl.value = draftHostUrl.value.trim();
				autoCheck.value = draftAutoCheck.value;
				settingsOpen.value = false;
			}
			function cancel() {
				settingsOpen.value = false;
			}
			return (_ctx, _cache) => {
				return isOpen.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", {
					key: 0,
					class: "bwgstuff-overlay",
					onClick: (0, vue.withModifiers)(cancel, ["self"])
				}, [(0, vue.createElementVNode)("div", _hoisted_1, [
					_cache[4] || (_cache[4] = (0, vue.createElementVNode)("h2", null, "BWG Settings", -1)),
					(0, vue.createElementVNode)("label", _hoisted_2, [_cache[2] || (_cache[2] = (0, vue.createElementVNode)("span", null, "Host URL", -1)), (0, vue.withDirectives)((0, vue.createElementVNode)("input", {
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => draftHostUrl.value = $event),
						type: "text",
						placeholder: "https://your-bwg-data-stuff-host"
					}, null, 512), [[vue.vModelText, draftHostUrl.value]])]),
					(0, vue.createElementVNode)("label", _hoisted_3, [(0, vue.withDirectives)((0, vue.createElementVNode)("input", {
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => draftAutoCheck.value = $event),
						type: "checkbox"
					}, null, 512), [[vue.vModelCheckbox, draftAutoCheck.value]]), _cache[3] || (_cache[3] = (0, vue.createElementVNode)("span", null, "Enable auto geo-block check", -1))]),
					(0, vue.createElementVNode)("div", { class: "bwgstuff-actions" }, [(0, vue.createElementVNode)("button", {
						type: "button",
						class: "bwgstuff-btn bwgstuff-btn--ghost",
						onClick: cancel
					}, "Cancel"), (0, vue.createElementVNode)("button", {
						type: "button",
						class: "bwgstuff-btn",
						onClick: save
					}, "Save")])
				])])) : (0, vue.createCommentVNode)("", true);
			};
		}
	});
	var _plugin_vue_export_helper_default = (sfc, props) => {
		const target = sfc.__vccOpts || sfc;
		for (const [key, val] of props) target[key] = val;
		return target;
	};
	var app_default = _plugin_vue_export_helper_default(app_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-163674e9"]]);
	var e = {
		UNKNOWN: "MAKOO_UNKNOWN",
		ADAPTER_NOT_FOUND: "MAKOO_ADAPTER_NOT_FOUND",
		ADAPTER_MOUNT_FAIL: "MAKOO_ADAPTER_MOUNT_FAIL",
		ADAPTER_UNMOUNT_FAIL: "MAKOO_ADAPTER_UNMOUNT_FAIL",
		TASK_NO_REGISTERED: "MAKOO_TASK_NO_REGISTERED",
		TASK_NOT_FOUND: "MAKOO_TASK_NOT_FOUND",
		TASK_INJECT_FAIL: "MAKOO_TASK_INJECT_FAIL",
		TASK_ALREADY_MOUNTED: "MAKOO_TASK_ALREADY_MOUNTED",
		TASK_TARGET_DETACHED: "MAKOO_TASK_TARGET_DETACHED",
		TASK_LISTENER_ATTACH_FAIL: "MAKOO_TASK_LISTENER_ATTACH_FAIL",
		TASK_SIGNAL_INVALID: "MAKOO_TASK_SIGNAL_INVALID",
		TASK_SIGNAL_BIND_FAIL: "MAKOO_TASK_SIGNAL_BIND_FAIL",
		CLI_SOURCE_DIR_NOT_FOUND: "MAKOO_CLI_SOURCE_DIR_NOT_FOUND",
		CLI_MANIFEST_LOAD_FAIL: "MAKOO_CLI_MANIFEST_LOAD_FAIL",
		CLI_MODULE_MANIFEST_LOAD_FAIL: "MAKOO_CLI_MODULE_MANIFEST_LOAD_FAIL",
		CLI_MANIFEST_NOT_FOUND: "MAKOO_CLI_MANIFEST_NOT_FOUND",
		CLI_NO_ENABLED_INJECTIONS: "MAKOO_CLI_NO_ENABLED_INJECTIONS",
		CLI_COMPONENT_NOT_FOUND: "MAKOO_CLI_COMPONENT_NOT_FOUND",
		CLI_CONFIG_INVALID: "MAKOO_CLI_CONFIG_INVALID",
		CLI_UNKNOWN_FRAMEWORK: "MAKOO_CLI_UNKNOWN_FRAMEWORK",
		CLI_UNSUPPORTED_FRAMEWORK: "MAKOO_CLI_UNSUPPORTED_FRAMEWORK",
		CLI_MODULE_ALREADY_EXISTS: "MAKOO_CLI_MODULE_ALREADY_EXISTS",
		CLI_MANIFEST_VALIDATION_FAIL: "MAKOO_CLI_MANIFEST_VALIDATION_FAIL",
		CLI_VITE_CONFIG_NOT_FOUND: "MAKOO_CLI_VITE_CONFIG_NOT_FOUND",
		CLI_PLUGIN_NOT_FOUND: "MAKOO_CLI_PLUGIN_NOT_FOUND",
		CLI_RUNTIME_SETUP_NOT_FOUND: "MAKOO_CLI_RUNTIME_SETUP_NOT_FOUND"
	};
	function t(e) {
		let t = [], n = e;
		for (; n;) t.push(`  cause: ${n.message}`), n = n.cause;
		return t;
	}
	var n = class extends Error {
		code;
		issues;
		cause;
		constructor(n, r, i = e.UNKNOWN, a) {
			let o = [`[makoo] ${n}`];
			if (r?.length) for (let e of r) o.push(`  - ${e.path}: ${e.message}`);
			for (let e of t(a)) o.push(e);
			super(o.join("\n")), this.name = "MakooError", this.code = i, this.issues = r ?? [], a && (this.cause = a);
		}
	};
	var r$1 = class extends n {
		constructor(t, n, r = e.ADAPTER_NOT_FOUND, i) {
			super(t, n, r, i), this.name = "AdapterError";
		}
	};
	var i$1 = class extends n {
		constructor(t, n, r = e.TASK_SIGNAL_INVALID, i) {
			super(t, n, r, i), this.name = "SignalError";
		}
	};
	var a$1 = class extends n {
		constructor(t, n, r = e.TASK_NO_REGISTERED, i) {
			super(t, n, r, i), this.name = "TaskError";
		}
	};
	var o$1 = class e {
		static LEVELS = [
			"debug",
			"info",
			"warn",
			"error"
		];
		level;
		static PREFIX = "[Makoo]";
		constructor(e = "info") {
			this.level = e;
		}
		setLevel(e) {
			this.level = e;
		}
		getLevel() {
			return this.level;
		}
		log(t, n, ...r) {
			let i = ( new Date()).toISOString(), a = e.LEVELS.indexOf(t), o = e.LEVELS.indexOf(this.level);
			a === -1 || o === -1 || a < o || console[t](`${e.PREFIX}[${t.toUpperCase()}][${i}] ${n}`, ...r);
		}
		info(e, ...t) {
			this.log("info", e, ...t);
		}
		error(e, ...t) {
			this.log("error", e, ...t);
		}
		warn(e, ...t) {
			this.log("warn", e, ...t);
		}
		debug(e, ...t) {
			this.log("debug", e, ...t);
		}
	};
	var s = () => {};
	function c(e) {
		return e ? (t, n = {}) => {
			e.emit({
				name: t,
				ts: Date.now(),
				...n
			});
		} : s;
	}
	function l(e, t, n) {
		if (t) for (let [r, i] of Object.entries(t)) {
			if (!i) continue;
			let t = Array.isArray(i) ? i : [i];
			for (let i of t) n ? e.onTask(n, r, i) : e.on(r, i);
		}
	}
	function u() {
		let e = !1, t = !1;
		return {
			ctrl: {
				stopPropagation() {
					e = !0;
				},
				stopImmediatePropagation() {
					e = !0, t = !0;
				}
			},
			isPropagationStopped() {
				return e;
			},
			isImmediatePropagationStopped() {
				return t;
			}
		};
	}
	function d(e = new o$1()) {
		let t = new Map(), n = new Map(), r = new Set();
		function i(e, n) {
			if (n) {
				let r = t.get(e);
				if (!r) return;
				r.delete(n), r.size === 0 && t.delete(e);
			} else t.delete(e);
		}
		function a(e, t, r) {
			let i = n.get(e);
			if (!i) return;
			if (!t) {
				n.delete(e);
				return;
			}
			if (!r) {
				i.delete(t), i.size === 0 && n.delete(e);
				return;
			}
			let a = i.get(t);
			a && (a.delete(r), a.size === 0 && i.delete(t), i.size === 0 && n.delete(e));
		}
		function s(e) {
			r.delete(e);
		}
		function c(e, t, n) {
			if (!(!e || e.size === 0)) for (let r of [...e]) {
				if (n.isImmediatePropagationStopped()) return;
				l(r, t, n.ctrl);
			}
		}
		function l(t, n, r) {
			try {
				t(n, r);
			} catch (t) {
				e.error(`Hook execution failed for event "${n.name}".`, t);
			}
		}
		function d(e, i) {
			let a = i.taskId === e ? i : {
				...i,
				taskId: e
			}, o = n.get(e)?.get(a.name), s = t.get(a.name), l = !!(o && o.size > 0), d = !!(s && s.size > 0);
			if (!l && !d && r.size === 0) return;
			let f = u();
			c(o, a, f), !f.isPropagationStopped() && (c(s, a, f), !f.isPropagationStopped() && c(r, a, f));
		}
		return {
			on(e, n) {
				return t.has(e) || t.set(e, new Set()), t.get(e)?.add(n), () => {
					i(e, n);
				};
			},
			onTask(e, t, r) {
				n.has(e) || n.set(e, new Map());
				let i = n.get(e);
				return i?.has(t) || i?.set(t, new Set()), i?.get(t)?.add(r), () => {
					a(e, t, r);
				};
			},
			onAny(e) {
				return r.add(e), () => {
					s(e);
				};
			},
			off: i,
			offTask: a,
			offAny: s,
			clear() {
				t.clear(), r.clear(), n.clear();
			},
			hasHooks(e) {
				if (e) {
					let i = t.get(e);
					if (i && i.size > 0 || r.size > 0) return !0;
					for (let t of n.values()) {
						let n = t.get(e);
						if (n && n.size > 0) return !0;
					}
					return !1;
				}
				if (r.size > 0) return !0;
				for (let e of t.values()) if (e.size > 0) return !0;
				for (let e of n.values()) for (let t of e.values()) if (t.size > 0) return !0;
				return !1;
			},
			emit(e) {
				if (e.taskId) {
					d(e.taskId, e);
					return;
				}
				let n = u();
				c(t.get(e.name), e, n), !n.isPropagationStopped() && c(r, e, n);
			},
			emitOnTask: d
		};
	}
	function p() {
		let e = [];
		return {
			resolve(t) {
				return e.find((e) => e.matches(t));
			},
			use(t) {
				e.includes(t) || e.push(t);
			}
		};
	}
	function m(e, t, n) {
		return n[e](t);
	}
	var h = {
		"signal:watcherReleased": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: { resource: "watcher" }
		}),
		"resource:listenerReleased": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				resource: "listener",
				listenerEvent: e.listenerEvent,
				listenAt: e.listenAt
			}
		}),
		"artifact:unmounted": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				resource: "component",
				artifactName: e.artifactName
			}
		})
	};
	function g(e, t) {
		return m(e, t, h);
	}
	var _ = {
		"task:statusChange": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			preStatus: e.preStatus
		}),
		"task:beforeReset": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status
		}),
		"task:afterReset": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			preStatus: e.preStatus
		}),
		"task:beforeDestroy": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status
		}),
		"task:afterDestroy": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			preStatus: e.preStatus
		})
	};
	function v(e, t) {
		return m(e, t, _);
	}
	function ee(e) {
		return typeof e == "object" && !!e;
	}
	function y(e) {
		return ee(e) && "get" in e && "subscribe" in e && typeof e.get == "function" && typeof e.subscribe == "function";
	}
	function b(t) {
		if (y(t)) return t;
		throw new i$1("Invalid activity signal source", [{
			path: "activitySignal",
			message: "must provide get() and subscribe() methods"
		}], e.TASK_SIGNAL_INVALID);
	}
	function ne(e, t) {
		let n = b(e);
		return t(n.get()), n.subscribe(t);
	}
	function x(e) {
		if (typeof e == "function") {
			e();
			return;
		}
		e.unsubscribe();
	}
	var S = new WeakMap();
	var C = 0;
	function w(e) {
		return e.kind === "component";
	}
	function T(e) {
		return w(e) ? e.injectAt : e.listenAt;
	}
	function E(e) {
		if (!e.withEvent) return;
		let t = w(e) ? e.listener : e;
		if (!(!t?.listenAt || !t.event || !t.callback)) return t;
	}
	function re(e, t) {
		if (t.id) return t.id;
		let n = t.artifactName ? `${t.artifactName}@${t.injectAt}` : `artifact-${t.injectAt}`, r = e.taskContext.get(n);
		if (r && w(r) && r.artifact === t.artifact) return n;
		let i = S.get(t.artifact);
		if (i) {
			let n = `${t.artifactName}#${i}@${t.injectAt}`, r = e.taskContext.get(n);
			if (r && w(r) && r.artifact === t.artifact) return n;
		}
		if (!r) return n;
		let a = ie(t.artifact), o = `${t.artifactName}#${a}@${t.injectAt}`, s = 2;
		for (;;) {
			let n = e.taskContext.get(o);
			if (!n || w(n) && n.artifact === t.artifact) return o;
			o = `${t.artifactName}#${a}-${s}@${t.injectAt}`, s++;
		}
	}
	function ie(e) {
		if (typeof e != "object" && typeof e != "function" || e === null) return C++, `artifact-${C}`;
		let t = e, n = S.get(t);
		if (n) return n;
		C++;
		let r = `artifact-${C}`;
		return S.set(t, r), r;
	}
	function D(e = s, t = new o$1()) {
		let n = new Map();
		function r(e, t) {
			let r = n.get(e);
			if (r) return t ? r.kind === t ? r : void 0 : r;
		}
		let i = {
			taskErrorMessages: [],
			taskRecords: [],
			set(e, t) {
				n.set(e, t);
			},
			get: r,
			has(e) {
				return n.has(e);
			},
			keys() {
				return n.keys();
			},
			getTaskStatus(e) {
				let t = n.get(e);
				return t ? t.taskStatus : void 0;
			},
			setTaskStatus(r, i) {
				let a = n.get(r);
				if (!a) {
					t.warn(`Task "${r}" not found, may already be destroyed`);
					return;
				}
				if (a.taskStatus === i) return;
				let o = a.taskStatus;
				a.taskStatus = i;
				let s = T(a);
				e("task:statusChange", v("task:statusChange", {
					taskId: r,
					kind: a.kind,
					injectAt: s,
					status: i,
					preStatus: o
				}));
			},
			destroy(e) {
				let r = n.get(e);
				if (!r) {
					t.warn(`Task "${e}" not found, may already be destroyed`);
					return;
				}
				i.setTaskStatus(e, "idle"), i.taskRecords = i.taskRecords.filter((t) => t.taskId !== e), i.taskErrorMessages = i.taskErrorMessages.filter((t) => t.taskId !== e), i.releaseWatcher(e), i.releaseListener(e), w(r) && (i.releaseComponentInstance(e), i.releaseDomElement(e)), n.delete(e);
			},
			destroyAll() {
				let e = Array.from(n.keys());
				for (let t of e) i.releaseWatcher(t);
				for (let t of e) {
					i.releaseListener(t);
					let e = n.get(t);
					e && w(e) && (i.releaseComponentInstance(t), i.releaseDomElement(t));
				}
				n.clear(), i.taskRecords = [], i.taskErrorMessages = [], t.info("All tasks destroyed");
			},
			releaseComponentInstance(r) {
				let i = n.get(r);
				if (i && w(i) && i.mountHandle && i.appRoot) try {
					i.adapter.unmount({
						host: i.hostElement,
						mountPoint: i.appRoot,
						handle: i.mountHandle,
						taskId: r,
						injectAt: i.injectAt,
						reason: "destroy"
					}), i.mountHandle = void 0, i.instance = void 0, e("artifact:unmounted", g("artifact:unmounted", {
						taskId: r,
						kind: "component",
						injectAt: i.injectAt,
						status: i.taskStatus,
						artifactName: i.artifactName
					}));
				} catch (e) {
					t.error(`Failed to unmount component for task "${r}":`, e);
				}
				else t.warn(`Component for task "${r}" already unmounted`);
			},
			releaseDomElement(e) {
				let r = n.get(e);
				if (!r || !w(r)) {
					t.warn(`Task "${e}" context not found, unable to remove root element`);
					return;
				}
				if (!r.appRoot) {
					t.warn(`Root element for task "${e}" not found, may already be removed`);
					return;
				}
				try {
					r.appRoot.remove(), r.appRoot = void 0, r.hostElement = void 0;
				} catch (n) {
					t.error(`Failed to remove root element for task "${e}":`, n);
				}
			},
			releaseListener(r) {
				let i = n.get(r);
				if (!i) return;
				let a = E(i), o = a?.event ?? (w(i) ? i.listener?.event : i.event), s = a?.listenAt ?? (w(i) ? i.listener?.listenAt : i.listenAt);
				if (a?.controller) try {
					a.controller.abort();
				} catch (e) {
					t.error(`Failed to abort listener for task "${r}":`, e);
				}
				a && (a.controller = void 0), w(i) && (i.listener = void 0), i.withEvent = !1, e("resource:listenerReleased", g("resource:listenerReleased", {
					taskId: r,
					kind: i.kind,
					injectAt: T(i),
					status: i.taskStatus,
					listenerEvent: o,
					listenAt: s
				}));
			},
			releaseWatcher(r) {
				let i = n.get(r);
				if (i?.watcher) try {
					x(i.watcher.watcher), i.watcher = void 0, e("signal:watcherReleased", g("signal:watcherReleased", {
						taskId: r,
						kind: i.kind,
						injectAt: T(i),
						status: i.taskStatus
					}));
				} catch (e) {
					t.error(`Failed to stop watcher for task "${r}":`, e);
				}
			},
			reset(r) {
				let a = n.get(r);
				if (!a) return;
				let o = !1;
				if (w(a) && a.mountHandle && a.appRoot) try {
					a.adapter.unmount({
						host: a.hostElement,
						mountPoint: a.appRoot,
						handle: a.mountHandle,
						taskId: r,
						injectAt: a.injectAt,
						reason: "reset"
					}), o = !0;
				} catch (e) {
					t.warn(`Failed to unmount component for task "${r}" during reset:`, e);
				}
				i.setTaskStatus(r, "idle"), o && w(a) && e("artifact:unmounted", g("artifact:unmounted", {
					taskId: r,
					kind: "component",
					injectAt: a.injectAt,
					status: a.taskStatus,
					artifactName: a.artifactName
				})), w(a) && (a.mountHandle = void 0, a.instance = void 0, a.hostElement = void 0, a.appRoot?.remove(), a.appRoot = void 0, a.isObserver = !1), a.watcher && i.releaseWatcher(r);
				let s = E(a), c = s?.event, l = s?.listenAt;
				s?.controller && (s.controller.abort(), s.controller = void 0), s && e("resource:listenerReleased", g("resource:listenerReleased", {
					taskId: r,
					kind: a.kind,
					injectAt: T(a),
					status: a.taskStatus,
					listenerEvent: c,
					listenAt: l
				}));
			},
			resetAll() {
				for (let e of n.keys()) i.reset(e);
			}
		};
		return i;
	}
	var O = {
		"alive:enabled": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: { scope: e.scope }
		}),
		"alive:disabled": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: { scope: e.scope }
		}),
		"alive:observerStarted": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				scope: e.scope,
				observerMode: e.observerMode
			}
		}),
		"alive:observerStopped": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				scope: e.scope,
				observerMode: e.observerMode
			}
		})
	};
	function k(e, t) {
		return m(e, t, O);
	}
	var A = {
		"dom:targetFound": (e) => ({
			injectAt: e.injectAt,
			taskId: e.taskId,
			kind: e.kind,
			durationMs: e.durationMs,
			meta: { root: e.root }
		}),
		"dom:targetTimeout": (e) => ({
			injectAt: e.injectAt,
			taskId: e.taskId,
			kind: e.kind,
			durationMs: e.durationMs,
			meta: { root: e.root }
		}),
		"dom:targetRemoved": (e) => ({
			injectAt: e.injectAt,
			taskId: e.taskId,
			kind: e.kind,
			meta: { phase: "removed" }
		}),
		"dom:targetRestored": (e) => ({
			injectAt: e.injectAt,
			taskId: e.taskId,
			kind: e.kind,
			durationMs: e.durationMs
		})
	};
	function j(e, t) {
		return m(e, t, A);
	}
	function M(e) {
		let t = Date.now(), n, r = e.root instanceof Document ? "document" : "element";
		return (i) => {
			if (i === "dom:targetFound") {
				e.emit("dom:targetFound", j("dom:targetFound", {
					injectAt: e.injectAt,
					taskId: e.taskId,
					kind: e.kind,
					durationMs: Date.now() - t,
					root: r
				}));
				return;
			}
			if (i === "dom:targetTimeout") {
				e.emit("dom:targetTimeout", j("dom:targetTimeout", {
					injectAt: e.injectAt,
					taskId: e.taskId,
					kind: e.kind,
					durationMs: Date.now() - t,
					root: r
				}));
				return;
			}
			if (i === "dom:targetRemoved") {
				n = Date.now(), e.emit("dom:targetRemoved", j("dom:targetRemoved", {
					injectAt: e.injectAt,
					taskId: e.taskId,
					kind: e.kind
				}));
				return;
			}
			e.emit("dom:targetRestored", j("dom:targetRestored", {
				injectAt: e.injectAt,
				taskId: e.taskId,
				kind: e.kind,
				durationMs: Date.now() - (n ?? t)
			}));
		};
	}
	function N(e, t, n = document, r, i = {
		logger: new o$1(),
		emit: s
	}) {
		let a = [], c = !1, l = () => {
			if (!c) {
				c = !0;
				for (let e of a) e.disconnect();
				a.length = 0;
			}
		}, u = (n, a) => {
			i.emit("dom:targetFound"), t(n, a), r?.once && (l(), i.logger.info(`Element "${e}" found, observer disconnected`));
		};
		return ((t) => {
			c || (oe(t, e, u), !c && se(t, e, a, u));
		})(n), r?.timeout && setTimeout(() => {
			c || (l(), i.emit("dom:targetTimeout"), i.logger.warn(`Element "${e}" not found within ${r.timeout}ms, observer disconnected`));
		}, r.timeout), l;
	}
	function ae(e, t, n, r, i = document, a, c = {
		logger: new o$1(),
		emit: s
	}) {
		let l = !0, u, d = ce(e, () => {
			c.emit("dom:targetRemoved"), n(), l && (u = N(t, (e) => {
				l && (c.emit("dom:targetRestored"), r(e));
			}, document, a, c));
		}, i, c.logger);
		return () => {
			l && (l = !1, d?.disconnect(), u?.(), c.logger.info(`Alive observer for "${t}" stopped`));
		};
	}
	var P = {
		onDomReady: N,
		onDomAlive: ae
	};
	function oe(e, t, n) {
		let r = (e instanceof Document ? e : e.ownerDocument).querySelector(t);
		r && n(r, void 0);
	}
	function se(e, t, n, r) {
		let i = new MutationObserver((e, n) => {
			for (let i of e) i.addedNodes.forEach((e) => {
				e.nodeType === 1 && le(e, t, n, r);
			});
		}), a = F(e);
		a && (i.observe(a, {
			childList: !0,
			subtree: !0
		}), n.push(i));
	}
	function ce(e, t, n, r) {
		let i = F(n), a = i instanceof HTMLBodyElement;
		if (i === null) return r.error("Failed to set up removal observer: no valid observation target found"), null;
		if (!a && !i.isConnected) return r.error("Failed to set up removal observer: observation target is detached from DOM"), null;
		let o = a ? i : i.parentElement || i;
		if (!o) return t(), null;
		let s = new MutationObserver((n, r) => {
			for (let i of n) i.removedNodes.forEach((n) => {
				n === e && (t(r), r.disconnect());
			});
		});
		return s.observe(o, {
			childList: !0,
			subtree: !!a
		}), r.info("Removal observer started", o), s;
	}
	function le(e, t, n, r) {
		let i = e.matches(t) ? e : e.querySelector(t);
		i && r(i, n);
	}
	function F(e) {
		return (e instanceof Document ? e.body : e) || document.body;
	}
	var I = function(e) {
		return e.OPEN = "OPEN", e.CLOSE = "CLOSE", e;
	}({});
	var ue = {
		"artifact:mountStart": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				artifactName: e.artifactName,
				alive: e.alive,
				scope: e.scope,
				withEvent: e.withEvent
			}
		}),
		"artifact:mountSuccess": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				artifactName: e.artifactName,
				alive: e.alive,
				scope: e.scope
			}
		}),
		"artifact:mountFail": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: "idle",
			error: e.error,
			meta: { artifactName: e.artifactName }
		})
	};
	function L(e, t) {
		return m(e, t, ue);
	}
	var R = {
		"listener:attached": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				listenerEvent: e.listenerEvent,
				listenAt: e.listenAt
			}
		}),
		"listener:detached": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				listenerEvent: e.listenerEvent,
				listenAt: e.listenAt
			}
		}),
		"listener:attachFail": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			error: e.error,
			meta: {
				listenerEvent: e.listenerEvent,
				listenAt: e.listenAt
			}
		})
	};
	function z(e, t) {
		return m(e, t, R);
	}
	var B = {
		"start:requested": (e) => ({ meta: {
			totalTasks: e.totalTasks,
			idleTasks: e.idleTasks,
			pendingTasks: e.pendingTasks,
			activeTasks: e.activeTasks
		} }),
		"start:taskScheduled": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			preStatus: e.preStatus,
			meta: { timeout: e.timeout }
		}),
		"start:taskSkipped": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: { skipReason: e.skipReason }
		}),
		"task:targetReady": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status
		})
	};
	function V(e, t) {
		return m(e, t, B);
	}
	function H() {
		return "xxxxxxxx".replace(/[xy]/g, (e) => {
			let t = Math.random() * 16 | 0;
			return (e === "x" ? t : t & 3 | 8).toString(16);
		});
	}
	function U(t, n) {
		let r = new Set(n), i = t.taskContext.taskRecords.filter(({ taskId: e }) => r.has(e)), o = i.reduce((e, { taskId: n }) => {
			let r = t.taskContext.getTaskStatus(n);
			return r === "idle" && (e.idleTasks += 1), r === "pending" && (e.pendingTasks += 1), r === "active" && (e.activeTasks += 1), e;
		}, {
			totalTasks: i.length,
			idleTasks: 0,
			pendingTasks: 0,
			activeTasks: 0
		});
		if (t.emit("start:requested", V("start:requested", o)), i.length === 0) throw new a$1("No registered tasks found, call start() with tasks before starting", [], e.TASK_NO_REGISTERED);
		i.forEach(({ taskId: e, injectAt: n }) => {
			let r = t.taskContext.getTaskStatus(e), i = t.taskContext.get(e);
			if (!(!i || !r)) {
				if (r === "active" || r === "pending") {
					t.emit("start:taskSkipped", V("start:taskSkipped", {
						taskId: e,
						kind: i.kind,
						injectAt: n,
						status: r,
						skipReason: r === "active" ? "already-active" : "already-pending"
					}));
					return;
				}
				P.onDomReady(n, (n) => W(t, n, e), document, {
					once: !0,
					timeout: i.timeout
				}, {
					logger: t.logger,
					emit: M({
						emit: t.emit,
						taskId: e,
						kind: i.kind,
						injectAt: n,
						root: document
					})
				}), t.taskContext.getTaskStatus(e) !== "active" && (t.taskContext.setTaskStatus(e, "pending"), t.emit("start:taskScheduled", V("start:taskScheduled", {
					taskId: e,
					kind: i.kind,
					injectAt: n,
					status: "pending",
					preStatus: "idle",
					timeout: i.timeout
				})));
			}
		});
	}
	function W(t, n, r) {
		let i = t.taskContext.get(r);
		if (!i) {
			t.logger.error(`Task "${r}" not found, unable to proceed with injection`);
			return;
		}
		if (t.emit("task:targetReady", V("task:targetReady", {
			taskId: r,
			kind: i.kind,
			injectAt: T(i),
			status: i.taskStatus
		})), i.taskStatus === "active") return;
		let o = T(i);
		if (w(i)) {
			t.emit("artifact:mountStart", L("artifact:mountStart", {
				taskId: r,
				kind: "component",
				injectAt: i.injectAt,
				status: i.taskStatus,
				artifactName: i.artifactName,
				alive: i.alive,
				scope: i.scope,
				withEvent: i.withEvent
			}));
			let o = fe(t, n, r);
			if (!o.isSuccess) {
				t.taskContext.setTaskStatus(r, "idle"), t.emit("artifact:mountFail", L("artifact:mountFail", {
					taskId: r,
					kind: "component",
					injectAt: i.injectAt,
					status: "idle",
					error: o.error ?? new a$1(`Component inject failed for task "${r}"`, [{
						path: "taskId",
						message: r
					}], e.TASK_INJECT_FAIL),
					artifactName: i.artifactName
				}));
				return;
			}
			t.emit("artifact:mountSuccess", L("artifact:mountSuccess", {
				taskId: r,
				kind: "component",
				injectAt: i.injectAt,
				status: i.taskStatus,
				artifactName: i.artifactName,
				alive: i.alive,
				scope: i.scope
			}));
		}
		if (i.withEvent) {
			let n = null, s = E(i);
			if (n = s?.activitySignal ? G(t, r, s.activitySignal()) : K(t, r, I.OPEN), n === !1) {
				t.taskContext.setTaskStatus(r, "idle");
				let n = E(i);
				t.emit("listener:attachFail", z("listener:attachFail", {
					taskId: r,
					kind: i.kind,
					injectAt: o,
					status: "idle",
					error: new a$1(`Listener attach failed for task "${r}"`, [{
						path: "taskId",
						message: r
					}], e.TASK_LISTENER_ATTACH_FAIL),
					listenerEvent: n?.event,
					listenAt: n?.listenAt
				}));
				return;
			}
		}
		t.taskContext.setTaskStatus(r, "active");
	}
	function G(t, n, r) {
		let a = t.taskContext.get(n);
		if (!a) return t.logger.error(`Task "${n}" not found, unable to bind activity signal`), !1;
		a.watcher &&= (x(a.watcher.watcher), void 0);
		try {
			return a.watcher = {
				watcher: ne(r, (e) => {
					K(t, n, e ? I.OPEN : I.CLOSE);
				}),
				watchSource: r
			}, !0;
		} catch (r) {
			let a = r instanceof i$1 ? r : new i$1(`Failed to bind activity signal for task "${n}"`, [{
				path: "taskId",
				message: n
			}], e.TASK_SIGNAL_BIND_FAIL, r instanceof Error ? r : void 0);
			return t.logger.error(`Failed to bind activity signal for task "${n}":`, a), !1;
		}
	}
	function K(t, n, r) {
		let i = t.taskContext.get(n);
		if (!i) return t.logger.error(`Task "${n}" not found, unable to manage listener state`), !1;
		let o = E(i);
		if (!o) return t.logger.warn(`Task "${n}" has no event binding configured`), !1;
		switch (r) {
			case I.OPEN: {
				if (o.controller) return !1;
				let r = de(t, n, i.kind, o.listenAt, o.event, o.callback);
				if (r) o.controller = r, t.emit("listener:attached", z("listener:attached", {
					taskId: n,
					kind: i.kind,
					injectAt: o.listenAt,
					status: i.taskStatus,
					listenerEvent: o.event,
					listenAt: o.listenAt
				}));
				else {
					let r = new a$1(`Failed to attach event "${o.event}" for task "${n}"`, [
						{
							path: "taskId",
							message: n
						},
						{
							path: "listener.event",
							message: o.event
						},
						{
							path: "listener.listenAt",
							message: o.listenAt
						}
					], e.TASK_LISTENER_ATTACH_FAIL);
					return t.logger.error(r.message), t.emit("listener:attachFail", z("listener:attachFail", {
						taskId: n,
						kind: i.kind,
						injectAt: o.listenAt,
						status: i.taskStatus,
						error: r,
						listenerEvent: o.event,
						listenAt: o.listenAt
					})), !1;
				}
				break;
			}
			case I.CLOSE:
				if (!o.controller) return !1;
				o.controller.abort(), o.controller = void 0, t.logger.info(`Event "${o.event}" detached from task "${n}"`), t.emit("listener:detached", z("listener:detached", {
					taskId: n,
					kind: i.kind,
					injectAt: o.listenAt,
					status: i.taskStatus,
					listenerEvent: o.event,
					listenAt: o.listenAt
				}));
				break;
			default: return t.logger.warn(`Unknown action type "${r}" for task "${n}"`), !1;
		}
		return !0;
	}
	function de(e, t, n, r, i, a) {
		let o = document.querySelector(r);
		if (o) {
			let n = new AbortController();
			return o.addEventListener(i, a, { signal: n.signal }), e.logger.info(`Event "${i}" attached at "${r}" (task: ${t})`), n;
		}
		let s = new AbortController();
		return P.onDomReady(r, (n) => {
			s.signal.aborted || (n.addEventListener(i, a, { signal: s.signal }), e.logger.info(`Event "${i}" attached at "${r}" (task: ${t})`));
		}, document, {
			once: !0,
			timeout: e.config.timeout
		}, {
			logger: e.logger,
			emit: M({
				emit: e.emit,
				taskId: t,
				kind: n,
				injectAt: r,
				root: document
			})
		}), s;
	}
	function fe(t, n, i) {
		let o = t.taskContext.get(i);
		if (!o || !w(o)) {
			let n = new a$1(`Task "${i}" context missing, injection aborted`, [{
				path: "taskId",
				message: i
			}], e.TASK_NOT_FOUND);
			return t.logger.error(n.message), {
				isSuccess: !1,
				error: n
			};
		}
		if (!o.taskId) {
			let n = new a$1(`No artifact found for task "${i}", injection aborted`, [{
				path: "taskId",
				message: i
			}], e.TASK_INJECT_FAIL);
			return t.logger.error(n.message), {
				isSuccess: !1,
				error: n
			};
		}
		if (o.mountHandle) {
			let n = new a$1(`Task "${i}" is already mounted, skipping`, [{
				path: "taskId",
				message: i
			}], e.TASK_ALREADY_MOUNTED);
			return t.logger.warn(n.message), {
				isSuccess: !1,
				error: n
			};
		}
		let s = o.injectAt, c = n.ownerDocument || document, l = c.createElement("div");
		if (l.id = `implant-root-${H()}`, l.style.display = "contents", l.style.zIndex = "999999", n.isConnected) n.appendChild(l);
		else {
			let n = new a$1(`Target element for task "${i}" is detached from DOM, injection skipped`, [{
				path: "taskId",
				message: i
			}], e.TASK_TARGET_DETACHED);
			return t.logger.warn(n.message), {
				isSuccess: !1,
				error: n
			};
		}
		try {
			let e = o.adapter.mount({
				host: n,
				mountPoint: l,
				artifact: o.artifact,
				taskId: i,
				injectAt: s,
				makoo: t.makooContext(i, s)
			});
			if (o.mountHandle = e.handle, o.hostElement = n, o.instance = e.instance, o.appRoot = l, t.logger.info(`Artifact "${o.artifactName}" injected at "${s}"`), o.alive && !o.isObserver) {
				let r = P.onDomAlive(n, s, () => {
					t.taskContext.reset(i);
				}, (e) => W(t, e, i), o.scope === "global" ? c : n, {
					once: !0,
					timeout: t.config.timeout
				}, {
					logger: t.logger,
					emit: M({
						emit: t.emit,
						taskId: i,
						kind: o.kind,
						injectAt: s,
						root: o.scope === "global" ? c : n
					})
				});
				!o.alive || o.mountHandle !== e.handle ? r() : (o.disableAlive = r, o.isObserver = !0, t.emit("alive:observerStarted", k("alive:observerStarted", {
					taskId: i,
					kind: "component",
					injectAt: s,
					status: o.taskStatus,
					scope: o.scope,
					observerMode: "mounted"
				})), t.logger.info(`Task "${i}" alive observer activated`));
			}
			return { isSuccess: !0 };
		} catch (n) {
			let a = new r$1(`Artifact mount failed for task "${i}"`, [{
				path: "taskId",
				message: i
			}], e.ADAPTER_MOUNT_FAIL, n instanceof Error ? n : void 0);
			return t.logger.error(`Artifact mount failed for task "${i}":`, a), l.remove(), {
				isSuccess: !1,
				error: a
			};
		}
	}
	function q(e, t) {
		let n = e.taskContext.get(t);
		if (!n) {
			e.logger.error(`Task "${t}" not found`);
			return;
		}
		if (!w(n)) {
			e.logger.warn(`enableAlive is not applicable to non-component task "${t}"`);
			return;
		}
		if (n.alive && n.isObserver) {
			e.logger.warn(`Task "${t}" already has an active alive observer`);
			return;
		}
		if (n.alive = !0, n.isObserver = !1, e.emit("alive:enabled", k("alive:enabled", {
			taskId: t,
			kind: "component",
			injectAt: n.injectAt,
			status: n.taskStatus,
			scope: n.scope
		})), n.disableAlive = () => {}, n.mountHandle && n.appRoot?.isConnected) {
			let r = n.hostElement ?? n.appRoot.parentElement;
			if (!r) {
				e.logger.warn(`Task "${t}": host element not found, unable to activate alive observer`);
				return;
			}
			let i = r.ownerDocument || document, a = n.injectAt, o = P.onDomAlive(r, a, () => {
				e.taskContext.reset(t);
			}, (n) => W(e, n, t), n.scope === "global" ? i : r, {
				once: !0,
				timeout: e.config.timeout
			}, {
				logger: e.logger,
				emit: M({
					emit: e.emit,
					taskId: t,
					kind: "component",
					injectAt: a,
					root: n.scope === "global" ? i : r
				})
			});
			if (!n.alive) {
				o();
				return;
			}
			n.disableAlive = o, n.isObserver = !0, e.emit("alive:observerStarted", k("alive:observerStarted", {
				taskId: t,
				kind: "component",
				injectAt: a,
				status: n.taskStatus,
				scope: n.scope,
				observerMode: "mounted"
			})), e.logger.info(`Task "${t}" alive observer activated`);
			return;
		}
		if (n.mountHandle && !n.appRoot?.isConnected && e.taskContext.reset(t), !n.mountHandle) {
			let r = !1, i = P.onDomReady(n.injectAt, (i) => {
				if (r || !n.alive) {
					e.logger.warn(`Task "${t}" alive state changed before element appears`);
					return;
				}
				W(e, i, t);
			}, document, {
				once: !0,
				timeout: e.config.timeout
			}, {
				logger: e.logger,
				emit: M({
					emit: e.emit,
					taskId: t,
					kind: "component",
					injectAt: n.injectAt,
					root: document
				})
			});
			n.disableAlive = () => {
				r || (r = !0, e.emit("alive:observerStopped", k("alive:observerStopped", {
					taskId: t,
					kind: "component",
					injectAt: n.injectAt,
					status: n.taskStatus,
					scope: n.scope,
					observerMode: "await-target"
				})), i());
			}, n.isObserver = !0, e.emit("alive:observerStarted", k("alive:observerStarted", {
				taskId: t,
				kind: "component",
				injectAt: n.injectAt,
				status: n.taskStatus,
				scope: n.scope,
				observerMode: "await-target"
			})), e.logger.info(`Task "${t}" awaiting target element for re-injection`);
		}
	}
	function J(e, t) {
		let n = e.taskContext.get(t);
		if (!n) {
			e.logger.error(`Task "${t}" not found`);
			return;
		}
		if (!w(n)) {
			e.logger.warn(`disableAlive is not applicable to non-component task "${t}"`);
			return;
		}
		if (!n.alive) {
			e.logger.warn(`Task "${t}" has no active alive observer to stop`);
			return;
		}
		let r = n.disableAlive;
		n.alive = !1, n.isObserver = !1, n.disableAlive = void 0, r?.(), e.emit("alive:disabled", k("alive:disabled", {
			taskId: t,
			kind: "component",
			injectAt: n.injectAt,
			status: n.taskStatus,
			scope: n.scope
		})), e.emit("alive:observerStopped", k("alive:observerStopped", {
			taskId: t,
			kind: "component",
			injectAt: n.injectAt,
			status: n.taskStatus,
			scope: n.scope,
			observerMode: n.mountHandle ? "mounted" : "await-target"
		}));
	}
	function Y(e, t) {
		let n = e.taskContext.get(t);
		if (!n) {
			e.logger.error(`Task ${t} not found`);
			return;
		}
		let r = n.taskStatus, i = T(n);
		e.emit("task:beforeDestroy", v("task:beforeDestroy", {
			taskId: t,
			kind: n.kind,
			injectAt: i,
			status: r
		})), w(n) && n.alive && J(e, t), e.taskContext.destroy(t), e.emit("task:afterDestroy", v("task:afterDestroy", {
			taskId: t,
			kind: n.kind,
			injectAt: i,
			preStatus: r
		}));
	}
	function pe(e) {
		for (let t of e.taskContext.keys()) {
			let n = e.taskContext.get(t);
			n && w(n) && n.alive && J(e, t);
		}
		e.taskContext.destroyAll();
	}
	function X(e, t) {
		let n = e.taskContext.get(t);
		if (!n) {
			e.logger.error(`Task ${t} not found`);
			return;
		}
		let r = n.taskStatus, i = T(n);
		e.emit("task:beforeReset", v("task:beforeReset", {
			taskId: t,
			kind: n.kind,
			injectAt: i,
			status: r
		})), w(n) && n.alive && J(e, t), e.taskContext.reset(t), e.emit("task:afterReset", v("task:afterReset", {
			taskId: t,
			kind: n.kind,
			injectAt: i,
			status: n.taskStatus,
			preStatus: r
		}));
	}
	function me(e) {
		for (let t of e.taskContext.keys()) {
			let n = e.taskContext.get(t);
			n && w(n) && n.alive && J(e, t);
		}
		e.taskContext.resetAll();
	}
	var he = {
		alive: !1,
		scope: "local",
		timeout: 5e3
	};
	function ge(e = {}) {
		let t = e.logger ?? new o$1(), n = e.observer ?? d(t), r = c(n), i = D(r, t), a = p();
		for (let t of e.adapters ?? []) a.use(t);
		let s = {
			config: {
				...he,
				...e.defaults,
				logger: t,
				observer: n,
				hooks: e.hooks
			},
			logger: t,
			emit: r,
			taskContext: i,
			adapterRegistry: a,
			makooContext(e, t) {
				return _e(s, e, t);
			}
		};
		return l(n, e.hooks), s;
	}
	function _e(e, t, n) {
		return {
			taskId: t,
			injectAt: n,
			enableAlive: () => q(e, t),
			disableAlive: () => J(e, t),
			reset: () => X(e, t),
			destroy: () => Y(e, t),
			on: (t, n) => e.config.observer?.on(t, n) ?? (() => {}),
			onTask: (n, r) => e.config.observer?.onTask(t, n, r) ?? (() => {}),
			off: (t, n) => e.config.observer?.off(t, n),
			offTask: (n, r) => e.config.observer?.offTask(t, n, r),
			getLogger: () => e.logger,
			bindListenerSignal: (n) => G(e, t, n),
			controlListener: (n) => K(e, t, n)
		};
	}
	var ve = {
		"register:start": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				artifactName: e.artifactName,
				listenerEvent: e.listenerEvent,
				listenAt: e.listenAt,
				alive: e.alive,
				scope: e.scope,
				timeout: e.timeout,
				withEvent: e.withEvent
			}
		}),
		"register:success": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: {
				artifactName: e.artifactName,
				listenerEvent: e.listenerEvent,
				listenAt: e.listenAt,
				alive: e.alive,
				scope: e.scope,
				timeout: e.timeout,
				withEvent: e.withEvent
			}
		}),
		"register:duplicate": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			meta: Z(e)
		}),
		"register:error": (e) => ({
			taskId: e.taskId,
			kind: e.kind,
			injectAt: e.injectAt,
			status: e.status,
			error: e.error,
			meta: Z(e)
		})
	};
	function Z(e) {
		return e.artifactName === void 0 ? e.listenerEvent === void 0 ? {} : { listenerEvent: e.listenerEvent } : { artifactName: e.artifactName };
	}
	function Q(e, t) {
		return m(e, t, ve);
	}
	var ye = new WeakMap();
	function be(e, t, n, r) {
		let i = e?.name || e?.__name;
		if (i) return i;
		if (typeof e == "string") return e;
		if (typeof e == "object" || typeof e == "function") {
			let r = e, i = t.get(r);
			if (i) return i;
			let a = `${n}-${H()}`;
			return t.set(r, a), a;
		}
		return r;
	}
	function xe(e) {
		return be(e, ye, "artifact", "artifact-anonymous");
	}
	function Se(e, t) {
		let { listenAt: n, event: r, callback: i, activitySignal: a } = t, o = `listener-${n}-${r}`;
		e.emit("register:start", Q("register:start", {
			taskId: o,
			kind: "listener",
			injectAt: n,
			status: "idle",
			listenerEvent: r,
			listenAt: n,
			withEvent: !0
		}));
		try {
			if (e.taskContext.has(o)) return e.logger.warn(`Listener "${o}" is already registered, skipping`), e.emit("register:duplicate", Q("register:duplicate", {
				taskId: o,
				kind: "listener",
				injectAt: n,
				status: e.taskContext.getTaskStatus(o) ?? "idle",
				listenerEvent: r
			})), {
				taskId: o,
				isSuccess: !0,
				isDuplicate: !0
			};
			let t = {
				taskId: o,
				kind: "listener",
				taskStatus: "idle",
				timeout: e.config.timeout,
				withEvent: !0,
				listenAt: n,
				event: r,
				callback: i
			};
			return a && (t.activitySignal = a), e.taskContext.set(o, t), e.taskContext.taskRecords.push({
				taskId: o,
				injectAt: n
			}), e.logger.info(`Listener "${o}" registered`), e.emit("register:success", Q("register:success", {
				taskId: o,
				kind: "listener",
				injectAt: n,
				status: "idle",
				listenerEvent: r,
				listenAt: n,
				withEvent: !0
			})), {
				taskId: o,
				isSuccess: !0
			};
		} catch (t) {
			return e.emit("register:error", Q("register:error", {
				taskId: o,
				kind: "listener",
				injectAt: n,
				status: e.taskContext.getTaskStatus(o) ?? "idle",
				error: t,
				listenerEvent: r
			})), {
				taskId: o,
				isSuccess: !1
			};
		}
	}
	function Ce(t, n) {
		let { id: i, injectAt: a, artifact: o, options: s } = n, c = xe(o), u = re(t, {
			id: i,
			artifactName: c,
			injectAt: a,
			artifact: o
		}), d = !!s?.on, f = s?.on?.type, p = s?.on?.listenAt, m = s?.alive ?? t.config.alive, h = s?.scope ?? t.config.scope, g = s?.timeout ?? t.config.timeout, _ = t.adapterRegistry.resolve(o);
		if (!_) throw new r$1(`No adapter found for artifact: ${c}`, [{
			path: "artifact",
			message: c
		}], e.ADAPTER_NOT_FOUND);
		t.emit("register:start", Q("register:start", {
			taskId: u,
			kind: "component",
			injectAt: a,
			status: "idle",
			artifactName: c,
			listenerEvent: f,
			listenAt: p,
			alive: m,
			scope: h,
			timeout: g,
			withEvent: d
		}));
		try {
			if (t.taskContext.has(u)) return t.logger.warn(`Task "${u}" is already registered, skipping`), t.emit("register:duplicate", Q("register:duplicate", {
				taskId: u,
				kind: "component",
				injectAt: a,
				status: t.taskContext.getTaskStatus(u) ?? "idle",
				artifactName: c
			})), {
				taskId: u,
				isSuccess: !0,
				isDuplicate: !0
			};
			let e = {
				taskId: u,
				taskStatus: "idle",
				kind: "component",
				artifactName: c,
				injectAt: a,
				artifact: o,
				adapter: _,
				withEvent: !1,
				alive: m,
				scope: h,
				timeout: g,
				isObserver: !1,
				hooks: s?.hooks
			};
			if (s?.on) {
				let t = {
					listenAt: s.on.listenAt,
					event: s.on.type,
					callback: s.on.callback
				};
				e.withEvent = !0, s.on.activitySignal && (t.activitySignal = s.on.activitySignal), e.listener = t;
			}
			return t.config.observer && s?.hooks && l(t.config.observer, s.hooks, u), t.taskContext.set(u, e), t.taskContext.taskRecords.push({
				taskId: u,
				injectAt: a
			}), t.logger.info(`Task "${u}" registered`), t.emit("register:success", Q("register:success", {
				taskId: u,
				kind: "component",
				injectAt: a,
				status: "idle",
				artifactName: c,
				listenerEvent: f,
				listenAt: p,
				alive: m,
				scope: h,
				timeout: g,
				withEvent: d
			})), {
				taskId: u,
				isSuccess: !0
			};
		} catch (e) {
			return t.emit("register:error", Q("register:error", {
				taskId: u,
				kind: "component",
				injectAt: a,
				status: t.taskContext.getTaskStatus(u) ?? "idle",
				error: e,
				artifactName: c
			})), {
				taskId: u,
				isSuccess: !1
			};
		}
	}
	function $(e = {}) {
		let t = ge(e);
		return {
			start(e) {
				e.length === 0 && U(t, []);
				let n = Ee(t, e);
				return n.length > 0 && U(t, n.map((e) => e.taskId)), De(t, n);
			},
			reset: (e) => X(t, e),
			destroy: (e) => Y(t, e),
			resetAll: () => me(t),
			destroyAll: () => pe(t),
			enableAlive: (e) => q(t, e),
			disableAlive: (e) => J(t, e),
			on: (e, n) => t.config.observer?.on(e, n) ?? (() => {}),
			onTask: (e, n, r) => t.config.observer?.onTask(e, n, r) ?? (() => {}),
			onAny: (e) => t.config.observer?.onAny(e) ?? (() => {}),
			off: (e, n) => t.config.observer?.off(e, n),
			offTask: (e, n, r) => t.config.observer?.offTask(e, n, r),
			offAny: (e) => t.config.observer?.offAny(e),
			getLogger: () => t.logger
		};
	}
	function we(e, t, n) {
		return typeof e == "string" ? {
			kind: "component",
			injectAt: e,
			artifact: t,
			...n ? { options: n } : {}
		} : {
			kind: "component",
			...e.id ? { id: e.id } : {},
			injectAt: e.injectAt,
			artifact: e.artifact,
			...e.options ? { options: e.options } : {}
		};
	}
	function Ee(e, t) {
		let n = [];
		for (let r of t) {
			if (r.kind === "component") {
				let t = Ce(e, {
					...r.id ? { id: r.id } : {},
					injectAt: r.injectAt,
					artifact: r.artifact,
					...r.options ? { options: r.options } : {}
				});
				t.isSuccess && !t.isDuplicate && n.push(Oe(e, t.taskId));
				continue;
			}
			let t = Se(e, r);
			t.isSuccess && !t.isDuplicate && n.push(ke(e, t.taskId));
		}
		return n;
	}
	function De(e, t) {
		let n = new Map(t.map((e) => [e.taskId, e]));
		return {
			tasks: t,
			get(t) {
				return e.taskContext.has(t) ? n.get(t) : void 0;
			},
			resetAll() {
				for (let n of t) e.taskContext.has(n.taskId) && X(e, n.taskId);
			},
			destroyAll() {
				for (let n of t) e.taskContext.has(n.taskId) && Y(e, n.taskId);
			}
		};
	}
	function Oe(e, t) {
		return {
			kind: "component",
			taskId: t,
			enableAlive: () => q(e, t),
			disableAlive: () => J(e, t),
			reset: () => X(e, t),
			destroy: () => Y(e, t)
		};
	}
	function ke(e, t) {
		return {
			kind: "listener",
			taskId: t,
			open: () => K(e, t, I.OPEN),
			close: () => K(e, t, I.CLOSE),
			destroy: () => Y(e, t)
		};
	}
	var r = class extends r$1 {
		constructor(e$1, n, r, i) {
			super(e$1, n, r ?? e.ADAPTER_MOUNT_FAIL, i), this.name = "VueAdapterError";
		}
	};
	function i(e) {
		return (typeof e == "object" && !!e || typeof e == "function") && ("setup" in e || "render" in e || "template" in e || "__vccOpts" in e || "__asyncLoader" in e);
	}
	var a = new class {
		plugins = [];
		getPlugins() {
			return [...this.plugins];
		}
		use(e) {
			this.plugins.includes(e) || this.plugins.push(e);
		}
		usePlugins(...e) {
			for (let t of e) this.use(t);
		}
		clear() {
			this.plugins = [];
		}
	}();
	function o() {
		return {
			name: "vue",
			matches: i,
			mount({ mountPoint: e$2, artifact: i, makoo: o }) {
				try {
					let t = (0, vue.createApp)(i, { makoo: o }), r = a.getPlugins();
					for (let e of r) t.use(e);
					return {
						handle: t,
						instance: t.mount(e$2)
					};
				} catch (n) {
					throw new r(`Failed to mount Vue component at "${e$2}"`, [{
						path: "(mount)",
						message: n instanceof Error ? n.message : String(n)
					}], e.ADAPTER_MOUNT_FAIL, n instanceof Error ? n : void 0);
				}
			},
			unmount({ handle: e$4 }) {
				try {
					e$4.unmount();
				} catch (e$3) {
					throw new r("Failed to unmount Vue component", [{
						path: "(unmount)",
						message: e$3 instanceof Error ? e$3.message : String(e$3)
					}], e.ADAPTER_UNMOUNT_FAIL, e$3 instanceof Error ? e$3 : void 0);
				}
			}
		};
	}
	var makoo;
	try {
		makoo = $({
			defaults: {
				"alive": false,
				"scope": "local",
				"timeout": 5e3
			},
			adapters: [o()]
		});
		const makooTasks = [];
		makooTasks.push(we({
			"id": "settings",
			"injectAt": "body",
			"artifact": app_default,
			"options": {
				"alive": false,
				"scope": "local",
				"timeout": 5e3
			}
		}));
		makoo.start(makooTasks);
	} catch (e) {
		console.error("[makoo] Injection startup failed:", e);
		throw e;
	}
})(Vue);