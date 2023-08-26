(function polyfill() {
    const relList = document.createElement("link").relList;
    if (relList && relList.supports && relList.supports("modulepreload")) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== "childList") {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === "LINK" && node.rel === "modulepreload")
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(link) {
        const fetchOpts = {};
        if (link.integrity)
            fetchOpts.integrity = link.integrity;
        if (link.referrerPolicy)
            fetchOpts.referrerPolicy = link.referrerPolicy;
        if (link.crossOrigin === "use-credentials")
            fetchOpts.credentials = "include";
        else if (link.crossOrigin === "anonymous")
            fetchOpts.credentials = "omit";
        else
            fetchOpts.credentials = "same-origin";
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            return;
        link.ep = true;
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
})();
const auiPrototyping = "";
function noop() {
}
function run(fn) {
    return fn();
}
function blank_object() {
    return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === "function";
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
function element(name) {
    return document.createElement(name);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element2) {
    return Array.from(element2.childNodes);
}
let current_component;
function set_current_component(component) {
    current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
    if (flushidx !== 0) {
        return;
    }
    const saved_component = current_component;
    do {
        try {
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
        } catch (e) {
            dirty_components.length = 0;
            flushidx = 0;
            throw e;
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
}
const outroing = /* @__PURE__ */ new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function mount_component(component, target, anchor) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    add_render_callback(() => {
        const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
        if (component.$$.on_destroy) {
            component.$$.on_destroy.push(...new_on_destroy);
        } else {
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        flush_render_callbacks($$.after_update);
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance ? instance(component, options.props || {}, (i, ret, ...rest) => {
        const value = rest.length ? rest[0] : ret;
        if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
            if (!$$.skip_bound && $$.bound[i])
                $$.bound[i](value);
            if (ready)
                make_dirty(component, i);
        }
        return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        } else {
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    $$ = void 0;
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    $$set = void 0;
    /** @returns {void} */
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    /**
     * @template {Extract<keyof Events, string>} K
     * @param {K} type
     * @param {((e: Events[K]) => void) | null | undefined} callback
     * @returns {() => void}
     */
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    /**
     * @param {Partial<Props>} props
     * @returns {void}
     */
    $set(props) {
        if (this.$$set && !is_empty(props)) {
            this.$$.skip_bound = true;
            this.$$set(props);
            this.$$.skip_bound = false;
        }
    }
}
const PUBLIC_VERSION = "4";
if (typeof window !== "undefined")
    (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
function create_fragment(ctx) {
    let div18;
    return {
        c() {
            div18 = element("div");
            div18.innerHTML = `<div id="content"><section><form id="admin" class="aui left-label"><div class="aui-page-header"><div class="aui-page-header-inner"><div class="aui-page-header-main"><h1>Usage jira admin configuration</h1></div> <div class="aui-page-header-actions"><div class="aui-buttons"><button type="button" class="aui-button" id="save-button">submit</button></div></div></div></div> <div class="aui-page-panel"><div class="form-body"><div class="field-group"><label for="host">Host
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="host" name="host" class="text"/></div> <div class="field-group"><label for="ip">IP
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="ip" name="ip" class="text"/></div> <div class="field-group"><label for="port">Port
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="port" name="port" class="text"/></div> <div class="field-group"><label for="product-code">Product Code
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="product-code" name="product-code" class="text"/></div> <div class="field-group"><label for="module">Module
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="module" name="module" class="text"/></div> <div class="field-group"><label for="tenant-code">Tenant Code
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="tenant-code" name="tenant-code" class="text"/></div> <div class="field-group"><label for="user-list-api-url">User list API URL
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="user-list-api-url" name="user-list-api-url" class="text"/></div> <div class="field-group"><label for="user-list-api-key">User list API Key
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="user-list-api-key" name="user-list-api-key" class="text"/></div> <div class="field-group"><label for="user-count-api-url">User count API URL
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="user-count-api-url" name="user-count-api-url" class="text"/></div> <div class="field-group"><label for="user-count-api-key">User count API Key
                                <span class="aui-icon icon-required"></span></label> <input type="text" id="user-count-api-key" name="user-count-api-key" class="text"/></div></div></div></form></section></div>`;
            attr(div18, "id", "page");
        },
        m(target, anchor) {
            insert(target, div18, anchor);
        },
        p: noop,
        i: noop,
        o: noop,
        d(detaching) {
            if (detaching) {
                detach(div18);
            }
        }
    };
}
class App extends SvelteComponent {
    constructor(options) {
        super();
        init(this, options, null, create_fragment, safe_not_equal, {});
    }
}
new App({
    target: document.getElementById("app")
});
//# sourceMappingURL=index.js.map
