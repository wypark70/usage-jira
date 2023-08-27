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
function noop$1() {
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
function append(target, node) {
    target.appendChild(node);
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
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(" ");
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
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
function set_input_value(input, value) {
    input.value = value == null ? "" : value;
}
let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error("Function called outside component initialization");
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
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
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop$1,
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
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
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
        this.$destroy = noop$1;
    }
    /**
     * @template {Extract<keyof Events, string>} K
     * @param {K} type
     * @param {((e: Events[K]) => void) | null | undefined} callback
     * @returns {() => void}
     */
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop$1;
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
function bind(fn, thisArg) {
    return function wrap() {
        return fn.apply(thisArg, arguments);
    };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const kindOf = ((cache) => (thing) => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
    } else {
        result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
}
const isString = typeOfTest("string");
const isFunction = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
    if (kindOf(val) !== "object") {
        return false;
    }
    const prototype2 = getPrototypeOf(val);
    return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction(val.pipe);
const isFormData = (thing) => {
    let kind;
    return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
        kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
    if (obj === null || typeof obj === "undefined") {
        return;
    }
    let i;
    let l;
    if (typeof obj !== "object") {
        obj = [obj];
    }
    if (isArray(obj)) {
        for (i = 0, l = obj.length; i < l; i++) {
            fn.call(null, obj[i], i, obj);
        }
    } else {
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;
        for (i = 0; i < len; i++) {
            key = keys[i];
            fn.call(null, obj[key], key, obj);
        }
    }
}
function findKey(obj, key) {
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
            return _key;
        }
    }
    return null;
}
const _global = (() => {
    if (typeof globalThis !== "undefined")
        return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
    const { caseless } = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
            result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
            result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
            result[targetKey] = val.slice();
        } else {
            result[targetKey] = val;
        }
    };
    for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
    forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
            a[key] = bind(val, thisArg);
        } else {
            a[key] = val;
        }
    }, { allOwnKeys });
    return a;
};
const stripBOM = (content) => {
    if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
    }
    return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, "super", {
        value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};
    destObj = destObj || {};
    if (sourceObj == null)
        return destObj;
    do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
            prop = props[i];
            if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
                destObj[prop] = sourceObj[prop];
                merged[prop] = true;
            }
        }
        sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
    return destObj;
};
const endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === void 0 || position > str.length) {
        position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
    if (!thing)
        return null;
    if (isArray(thing))
        return thing;
    let i = thing.length;
    if (!isNumber(i))
        return null;
    const arr = new Array(i);
    while (i-- > 0) {
        arr[i] = thing[i];
    }
    return arr;
};
const isTypedArray = ((TypedArray) => {
    return (thing) => {
        return TypedArray && thing instanceof TypedArray;
    };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
    const generator = obj && obj[Symbol.iterator];
    const iterator = generator.call(obj);
    let result;
    while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
    }
};
const matchAll = (regExp, str) => {
    let matches;
    const arr = [];
    while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
    }
    return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
    return str.toLowerCase().replace(
        /[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
            return p1.toUpperCase() + p2;
        }
    );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
    const descriptors2 = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};
    forEach(descriptors2, (descriptor, name) => {
        if (reducer(descriptor, name, obj) !== false) {
            reducedDescriptors[name] = descriptor;
        }
    });
    Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
        if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
            return false;
        }
        const value = obj[name];
        if (!isFunction(value))
            return;
        descriptor.enumerable = false;
        if ("writable" in descriptor) {
            descriptor.writable = false;
            return;
        }
        if (!descriptor.set) {
            descriptor.set = () => {
                throw Error("Can not rewrite read-only method '" + name + "'");
            };
        }
    });
};
const toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};
    const define = (arr) => {
        arr.forEach((value) => {
            obj[value] = true;
        });
    };
    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
    return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
    value = +value;
    return Number.isFinite(value) ? value : defaultValue;
};
const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const DIGIT = "0123456789";
const ALPHABET = {
    DIGIT,
    ALPHA,
    ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
    let str = "";
    const { length } = alphabet;
    while (size--) {
        str += alphabet[Math.random() * length | 0];
    }
    return str;
};
function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === "FormData" && thing[Symbol.iterator]);
}
const toJSONObject = (obj) => {
    const stack = new Array(10);
    const visit = (source, i) => {
        if (isObject(source)) {
            if (stack.indexOf(source) >= 0) {
                return;
            }
            if (!("toJSON" in source)) {
                stack[i] = source;
                const target = isArray(source) ? [] : {};
                forEach(source, (value, key) => {
                    const reducedValue = visit(value, i + 1);
                    !isUndefined(reducedValue) && (target[key] = reducedValue);
                });
                stack[i] = void 0;
                return target;
            }
        }
        return source;
    };
    return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
const utils = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    ALPHABET,
    generateString,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable
};
function AxiosError(message, code, config, request, response) {
    Error.call(this);
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    } else {
        this.stack = new Error().stack;
    }
    this.message = message;
    this.name = "AxiosError";
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    response && (this.response = response);
}
utils.inherits(AxiosError, Error, {
    toJSON: function toJSON() {
        return {
            // Standard
            message: this.message,
            name: this.name,
            // Microsoft
            description: this.description,
            number: this.number,
            // Mozilla
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            // Axios
            config: utils.toJSONObject(this.config),
            code: this.code,
            status: this.response && this.response.status ? this.response.status : null
        };
    }
});
const prototype$1 = AxiosError.prototype;
const descriptors = {};
[
    "ERR_BAD_OPTION_VALUE",
    "ERR_BAD_OPTION",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ERR_FR_TOO_MANY_REDIRECTS",
    "ERR_DEPRECATED",
    "ERR_BAD_RESPONSE",
    "ERR_BAD_REQUEST",
    "ERR_CANCELED",
    "ERR_NOT_SUPPORT",
    "ERR_INVALID_URL"
    // eslint-disable-next-line func-names
].forEach((code) => {
    descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype$1);
    utils.toFlatObject(error, axiosError, function filter2(obj) {
        return obj !== Error.prototype;
    }, (prop) => {
        return prop !== "isAxiosError";
    });
    AxiosError.call(axiosError, error.message, code, config, request, response);
    axiosError.cause = error;
    axiosError.name = error.name;
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
};
const httpAdapter = null;
function isVisitable(thing) {
    return utils.isPlainObject(thing) || utils.isArray(thing);
}
function removeBrackets(key) {
    return utils.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
    if (!path)
        return key;
    return path.concat(key).map(function each(token, i) {
        token = removeBrackets(token);
        return !dots && i ? "[" + token + "]" : token;
    }).join(dots ? "." : "");
}
function isFlatArray(arr) {
    return utils.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
});
function toFormData(obj, formData, options) {
    if (!utils.isObject(obj)) {
        throw new TypeError("target must be an object");
    }
    formData = formData || new FormData();
    options = utils.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
    }, false, function defined(option, source) {
        return !utils.isUndefined(source[option]);
    });
    const metaTokens = options.metaTokens;
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
    const useBlob = _Blob && utils.isSpecCompliantForm(formData);
    if (!utils.isFunction(visitor)) {
        throw new TypeError("visitor must be a function");
    }
    function convertValue(value) {
        if (value === null)
            return "";
        if (utils.isDate(value)) {
            return value.toISOString();
        }
        if (!useBlob && utils.isBlob(value)) {
            throw new AxiosError("Blob is not supported. Use a Buffer instead.");
        }
        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
            return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
        }
        return value;
    }
    function defaultVisitor(value, key, path) {
        let arr = value;
        if (value && !path && typeof value === "object") {
            if (utils.endsWith(key, "{}")) {
                key = metaTokens ? key : key.slice(0, -2);
                value = JSON.stringify(value);
            } else if (utils.isArray(value) && isFlatArray(value) || (utils.isFileList(value) || utils.endsWith(key, "[]")) && (arr = utils.toArray(value))) {
                key = removeBrackets(key);
                arr.forEach(function each(el, index) {
                    !(utils.isUndefined(el) || el === null) && formData.append(
                        // eslint-disable-next-line no-nested-ternary
                        indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
                        convertValue(el)
                    );
                });
                return false;
            }
        }
        if (isVisitable(value)) {
            return true;
        }
        formData.append(renderKey(path, key, dots), convertValue(value));
        return false;
    }
    const stack = [];
    const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
    });
    function build(value, path) {
        if (utils.isUndefined(value))
            return;
        if (stack.indexOf(value) !== -1) {
            throw Error("Circular reference detected in " + path.join("."));
        }
        stack.push(value);
        utils.forEach(value, function each(el, key) {
            const result = !(utils.isUndefined(el) || el === null) && visitor.call(
                formData,
                el,
                utils.isString(key) ? key.trim() : key,
                path,
                exposedHelpers
            );
            if (result === true) {
                build(el, path ? path.concat(key) : [key]);
            }
        });
        stack.pop();
    }
    if (!utils.isObject(obj)) {
        throw new TypeError("data must be an object");
    }
    build(obj);
    return formData;
}
function encode$1(str) {
    const charMap = {
        "!": "%21",
        "'": "%27",
        "(": "%28",
        ")": "%29",
        "~": "%7E",
        "%20": "+",
        "%00": "\0"
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
    });
}
function AxiosURLSearchParams(params, options) {
    this._pairs = [];
    params && toFormData(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append2(name, value) {
    this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
    const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
    } : encode$1;
    return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + "=" + _encode(pair[1]);
    }, "").join("&");
};
function encode(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
    if (!params) {
        return url;
    }
    const _encode = options && options.encode || encode;
    const serializeFn = options && options.serialize;
    let serializedParams;
    if (serializeFn) {
        serializedParams = serializeFn(params, options);
    } else {
        serializedParams = utils.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
    }
    if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
            url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url;
}
class InterceptorManager {
    constructor() {
        this.handlers = [];
    }
    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
        this.handlers.push({
            fulfilled,
            rejected,
            synchronous: options ? options.synchronous : false,
            runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
    }
    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
     */
    eject(id) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }
    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
        if (this.handlers) {
            this.handlers = [];
        }
    }
    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
            if (h !== null) {
                fn(h);
            }
        });
    }
}
const InterceptorManager$1 = InterceptorManager;
const transitionalDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const isStandardBrowserEnv = (() => {
    let product;
    if (typeof navigator !== "undefined" && ((product = navigator.product) === "ReactNative" || product === "NativeScript" || product === "NS")) {
        return false;
    }
    return typeof window !== "undefined" && typeof document !== "undefined";
})();
const isStandardBrowserWebWorkerEnv = (() => {
    return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const platform = {
    isBrowser: true,
    classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
    },
    isStandardBrowserEnv,
    isStandardBrowserWebWorkerEnv,
    protocols: ["http", "https", "file", "blob", "url", "data"]
};
function toURLEncodedForm(data, options) {
    return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
            if (platform.isNode && utils.isBuffer(value)) {
                this.append(key, value.toString("base64"));
                return false;
            }
            return helpers.defaultVisitor.apply(this, arguments);
        }
    }, options));
}
function parsePropPath(name) {
    return utils.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
        return match[0] === "[]" ? "" : match[1] || match[0];
    });
}
function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
    }
    return obj;
}
function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils.isArray(target) ? target.length : name;
        if (isLast) {
            if (utils.hasOwnProp(target, name)) {
                target[name] = [target[name], value];
            } else {
                target[name] = value;
            }
            return !isNumericKey;
        }
        if (!target[name] || !utils.isObject(target[name])) {
            target[name] = [];
        }
        const result = buildPath(path, value, target[name], index);
        if (result && utils.isArray(target[name])) {
            target[name] = arrayToObject(target[name]);
        }
        return !isNumericKey;
    }
    if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
        const obj = {};
        utils.forEachEntry(formData, (name, value) => {
            buildPath(parsePropPath(name), value, obj, 0);
        });
        return obj;
    }
    return null;
}
const DEFAULT_CONTENT_TYPE = {
    "Content-Type": void 0
};
function stringifySafely(rawValue, parser, encoder) {
    if (utils.isString(rawValue)) {
        try {
            (parser || JSON.parse)(rawValue);
            return utils.trim(rawValue);
        } catch (e) {
            if (e.name !== "SyntaxError") {
                throw e;
            }
        }
    }
    return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
    transitional: transitionalDefaults,
    adapter: ["xhr", "http"],
    transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || "";
        const hasJSONContentType = contentType.indexOf("application/json") > -1;
        const isObjectPayload = utils.isObject(data);
        if (isObjectPayload && utils.isHTMLForm(data)) {
            data = new FormData(data);
        }
        const isFormData2 = utils.isFormData(data);
        if (isFormData2) {
            if (!hasJSONContentType) {
                return data;
            }
            return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }
        if (utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
            return data;
        }
        if (utils.isArrayBufferView(data)) {
            return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
            headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
            return data.toString();
        }
        let isFileList2;
        if (isObjectPayload) {
            if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
                return toURLEncodedForm(data, this.formSerializer).toString();
            }
            if ((isFileList2 = utils.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
                const _FormData = this.env && this.env.FormData;
                return toFormData(
                    isFileList2 ? { "files[]": data } : data,
                    _FormData && new _FormData(),
                    this.formSerializer
                );
            }
        }
        if (isObjectPayload || hasJSONContentType) {
            headers.setContentType("application/json", false);
            return stringifySafely(data);
        }
        return data;
    }],
    transformResponse: [function transformResponse(data) {
        const transitional2 = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
        const JSONRequested = this.responseType === "json";
        if (data && utils.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
            const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
            const strictJSONParsing = !silentJSONParsing && JSONRequested;
            try {
                return JSON.parse(data);
            } catch (e) {
                if (strictJSONParsing) {
                    if (e.name === "SyntaxError") {
                        throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
                    }
                    throw e;
                }
            }
        }
        return data;
    }],
    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
    },
    validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
    },
    headers: {
        common: {
            "Accept": "application/json, text/plain, */*"
        }
    }
};
utils.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
});
utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});
const defaults$1 = defaults;
const ignoreDuplicateOf = utils.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
]);
const parseHeaders = (rawHeaders) => {
    const parsed = {};
    let key;
    let val;
    let i;
    rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
        i = line.indexOf(":");
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();
        if (!key || parsed[key] && ignoreDuplicateOf[key]) {
            return;
        }
        if (key === "set-cookie") {
            if (parsed[key]) {
                parsed[key].push(val);
            } else {
                parsed[key] = [val];
            }
        } else {
            parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
        }
    });
    return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
    if (value === false || value == null) {
        return value;
    }
    return utils.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
    const tokens = /* @__PURE__ */ Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;
    while (match = tokensRE.exec(str)) {
        tokens[match[1]] = match[2];
    }
    return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
    if (utils.isFunction(filter2)) {
        return filter2.call(this, value, header);
    }
    if (isHeaderNameFilter) {
        value = header;
    }
    if (!utils.isString(value))
        return;
    if (utils.isString(filter2)) {
        return value.indexOf(filter2) !== -1;
    }
    if (utils.isRegExp(filter2)) {
        return filter2.test(value);
    }
}
function formatHeader(header) {
    return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
        return char.toUpperCase() + str;
    });
}
function buildAccessors(obj, header) {
    const accessorName = utils.toCamelCase(" " + header);
    ["get", "set", "has"].forEach((methodName) => {
        Object.defineProperty(obj, methodName + accessorName, {
            value: function(arg1, arg2, arg3) {
                return this[methodName].call(this, header, arg1, arg2, arg3);
            },
            configurable: true
        });
    });
}
class AxiosHeaders {
    constructor(headers) {
        headers && this.set(headers);
    }
    set(header, valueOrRewrite, rewrite) {
        const self2 = this;
        function setHeader(_value, _header, _rewrite) {
            const lHeader = normalizeHeader(_header);
            if (!lHeader) {
                throw new Error("header name must be a non-empty string");
            }
            const key = utils.findKey(self2, lHeader);
            if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
                self2[key || _header] = normalizeValue(_value);
            }
        }
        const setHeaders = (headers, _rewrite) => utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
        if (utils.isPlainObject(header) || header instanceof this.constructor) {
            setHeaders(header, valueOrRewrite);
        } else if (utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
            setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
            header != null && setHeader(valueOrRewrite, header, rewrite);
        }
        return this;
    }
    get(header, parser) {
        header = normalizeHeader(header);
        if (header) {
            const key = utils.findKey(this, header);
            if (key) {
                const value = this[key];
                if (!parser) {
                    return value;
                }
                if (parser === true) {
                    return parseTokens(value);
                }
                if (utils.isFunction(parser)) {
                    return parser.call(this, value, key);
                }
                if (utils.isRegExp(parser)) {
                    return parser.exec(value);
                }
                throw new TypeError("parser must be boolean|regexp|function");
            }
        }
    }
    has(header, matcher) {
        header = normalizeHeader(header);
        if (header) {
            const key = utils.findKey(this, header);
            return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }
        return false;
    }
    delete(header, matcher) {
        const self2 = this;
        let deleted = false;
        function deleteHeader(_header) {
            _header = normalizeHeader(_header);
            if (_header) {
                const key = utils.findKey(self2, _header);
                if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
                    delete self2[key];
                    deleted = true;
                }
            }
        }
        if (utils.isArray(header)) {
            header.forEach(deleteHeader);
        } else {
            deleteHeader(header);
        }
        return deleted;
    }
    clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;
        while (i--) {
            const key = keys[i];
            if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
                delete this[key];
                deleted = true;
            }
        }
        return deleted;
    }
    normalize(format) {
        const self2 = this;
        const headers = {};
        utils.forEach(this, (value, header) => {
            const key = utils.findKey(headers, header);
            if (key) {
                self2[key] = normalizeValue(value);
                delete self2[header];
                return;
            }
            const normalized = format ? formatHeader(header) : String(header).trim();
            if (normalized !== header) {
                delete self2[header];
            }
            self2[normalized] = normalizeValue(value);
            headers[normalized] = true;
        });
        return this;
    }
    concat(...targets) {
        return this.constructor.concat(this, ...targets);
    }
    toJSON(asStrings) {
        const obj = /* @__PURE__ */ Object.create(null);
        utils.forEach(this, (value, header) => {
            value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(", ") : value);
        });
        return obj;
    }
    [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
    }
    get [Symbol.toStringTag]() {
        return "AxiosHeaders";
    }
    static from(thing) {
        return thing instanceof this ? thing : new this(thing);
    }
    static concat(first, ...targets) {
        const computed = new this(first);
        targets.forEach((target) => computed.set(target));
        return computed;
    }
    static accessor(header) {
        const internals = this[$internals] = this[$internals] = {
            accessors: {}
        };
        const accessors = internals.accessors;
        const prototype2 = this.prototype;
        function defineAccessor(_header) {
            const lHeader = normalizeHeader(_header);
            if (!accessors[lHeader]) {
                buildAccessors(prototype2, _header);
                accessors[lHeader] = true;
            }
        }
        utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
        return this;
    }
}
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils.freezeMethods(AxiosHeaders.prototype);
utils.freezeMethods(AxiosHeaders);
const AxiosHeaders$1 = AxiosHeaders;
function transformData(fns, response) {
    const config = this || defaults$1;
    const context = response || config;
    const headers = AxiosHeaders$1.from(context.headers);
    let data = context.data;
    utils.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
    });
    headers.normalize();
    return data;
}
function isCancel(value) {
    return !!(value && value.__CANCEL__);
}
function CanceledError(message, config, request) {
    AxiosError.call(this, message == null ? "canceled" : message, AxiosError.ERR_CANCELED, config, request);
    this.name = "CanceledError";
}
utils.inherits(CanceledError, AxiosError, {
    __CANCEL__: true
});
function settle(resolve, reject, response) {
    const validateStatus2 = response.config.validateStatus;
    if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
        resolve(response);
    } else {
        reject(new AxiosError(
            "Request failed with status code " + response.status,
            [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
            response.config,
            response.request,
            response
        ));
    }
}
const cookies = platform.isStandardBrowserEnv ? (
    // Standard browser envs support document.cookie
    function standardBrowserEnv() {
        return {
            write: function write(name, value, expires, path, domain, secure) {
                const cookie = [];
                cookie.push(name + "=" + encodeURIComponent(value));
                if (utils.isNumber(expires)) {
                    cookie.push("expires=" + new Date(expires).toGMTString());
                }
                if (utils.isString(path)) {
                    cookie.push("path=" + path);
                }
                if (utils.isString(domain)) {
                    cookie.push("domain=" + domain);
                }
                if (secure === true) {
                    cookie.push("secure");
                }
                document.cookie = cookie.join("; ");
            },
            read: function read(name) {
                const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
                return match ? decodeURIComponent(match[3]) : null;
            },
            remove: function remove(name) {
                this.write(name, "", Date.now() - 864e5);
            }
        };
    }()
) : (
    // Non standard browser env (web workers, react-native) lack needed support.
    function nonStandardBrowserEnv() {
        return {
            write: function write() {
            },
            read: function read() {
                return null;
            },
            remove: function remove() {
            }
        };
    }()
);
function isAbsoluteURL(url) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
}
const isURLSameOrigin = platform.isStandardBrowserEnv ? (
    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
    function standardBrowserEnv2() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement("a");
        let originURL;
        function resolveURL(url) {
            let href = url;
            if (msie) {
                urlParsingNode.setAttribute("href", href);
                href = urlParsingNode.href;
            }
            urlParsingNode.setAttribute("href", href);
            return {
                href: urlParsingNode.href,
                protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
                host: urlParsingNode.host,
                search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
                hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
                hostname: urlParsingNode.hostname,
                port: urlParsingNode.port,
                pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
            };
        }
        originURL = resolveURL(window.location.href);
        return function isURLSameOrigin2(requestURL) {
            const parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
            return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
        };
    }()
) : (
    // Non standard browser envs (web workers, react-native) lack needed support.
    function nonStandardBrowserEnv2() {
        return function isURLSameOrigin2() {
            return true;
        };
    }()
);
function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || "";
}
function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;
    min = min !== void 0 ? min : 1e3;
    return function push(chunkLength) {
        const now = Date.now();
        const startedAt = timestamps[tail];
        if (!firstSampleTS) {
            firstSampleTS = now;
        }
        bytes[head] = chunkLength;
        timestamps[head] = now;
        let i = tail;
        let bytesCount = 0;
        while (i !== head) {
            bytesCount += bytes[i++];
            i = i % samplesCount;
        }
        head = (head + 1) % samplesCount;
        if (head === tail) {
            tail = (tail + 1) % samplesCount;
        }
        if (now - firstSampleTS < min) {
            return;
        }
        const passed = startedAt && now - startedAt;
        return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
    };
}
function progressEventReducer(listener, isDownloadStream) {
    let bytesNotified = 0;
    const _speedometer = speedometer(50, 250);
    return (e) => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : void 0;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;
        bytesNotified = loaded;
        const data = {
            loaded,
            total,
            progress: total ? loaded / total : void 0,
            bytes: progressBytes,
            rate: rate ? rate : void 0,
            estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
            event: e
        };
        data[isDownloadStream ? "download" : "upload"] = true;
        listener(data);
    };
}
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
        const responseType = config.responseType;
        let onCanceled;
        function done() {
            if (config.cancelToken) {
                config.cancelToken.unsubscribe(onCanceled);
            }
            if (config.signal) {
                config.signal.removeEventListener("abort", onCanceled);
            }
        }
        if (utils.isFormData(requestData)) {
            if (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv) {
                requestHeaders.setContentType(false);
            } else {
                requestHeaders.setContentType("multipart/form-data;", false);
            }
        }
        let request = new XMLHttpRequest();
        if (config.auth) {
            const username = config.auth.username || "";
            const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
            requestHeaders.set("Authorization", "Basic " + btoa(username + ":" + password));
        }
        const fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
        request.timeout = config.timeout;
        function onloadend() {
            if (!request) {
                return;
            }
            const responseHeaders = AxiosHeaders$1.from(
                "getAllResponseHeaders" in request && request.getAllResponseHeaders()
            );
            const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
            const response = {
                data: responseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config,
                request
            };
            settle(function _resolve(value) {
                resolve(value);
                done();
            }, function _reject(err) {
                reject(err);
                done();
            }, response);
            request = null;
        }
        if ("onloadend" in request) {
            request.onloadend = onloadend;
        } else {
            request.onreadystatechange = function handleLoad() {
                if (!request || request.readyState !== 4) {
                    return;
                }
                if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
                    return;
                }
                setTimeout(onloadend);
            };
        }
        request.onabort = function handleAbort() {
            if (!request) {
                return;
            }
            reject(new AxiosError("Request aborted", AxiosError.ECONNABORTED, config, request));
            request = null;
        };
        request.onerror = function handleError() {
            reject(new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, request));
            request = null;
        };
        request.ontimeout = function handleTimeout() {
            let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
            const transitional2 = config.transitional || transitionalDefaults;
            if (config.timeoutErrorMessage) {
                timeoutErrorMessage = config.timeoutErrorMessage;
            }
            reject(new AxiosError(
                timeoutErrorMessage,
                transitional2.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
                config,
                request
            ));
            request = null;
        };
        if (platform.isStandardBrowserEnv) {
            const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName && cookies.read(config.xsrfCookieName);
            if (xsrfValue) {
                requestHeaders.set(config.xsrfHeaderName, xsrfValue);
            }
        }
        requestData === void 0 && requestHeaders.setContentType(null);
        if ("setRequestHeader" in request) {
            utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
                request.setRequestHeader(key, val);
            });
        }
        if (!utils.isUndefined(config.withCredentials)) {
            request.withCredentials = !!config.withCredentials;
        }
        if (responseType && responseType !== "json") {
            request.responseType = config.responseType;
        }
        if (typeof config.onDownloadProgress === "function") {
            request.addEventListener("progress", progressEventReducer(config.onDownloadProgress, true));
        }
        if (typeof config.onUploadProgress === "function" && request.upload) {
            request.upload.addEventListener("progress", progressEventReducer(config.onUploadProgress));
        }
        if (config.cancelToken || config.signal) {
            onCanceled = (cancel) => {
                if (!request) {
                    return;
                }
                reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
                request.abort();
                request = null;
            };
            config.cancelToken && config.cancelToken.subscribe(onCanceled);
            if (config.signal) {
                config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
            }
        }
        const protocol = parseProtocol(fullPath);
        if (protocol && platform.protocols.indexOf(protocol) === -1) {
            reject(new AxiosError("Unsupported protocol " + protocol + ":", AxiosError.ERR_BAD_REQUEST, config));
            return;
        }
        request.send(requestData || null);
    });
};
const knownAdapters = {
    http: httpAdapter,
    xhr: xhrAdapter
};
utils.forEach(knownAdapters, (fn, value) => {
    if (fn) {
        try {
            Object.defineProperty(fn, "name", { value });
        } catch (e) {
        }
        Object.defineProperty(fn, "adapterName", { value });
    }
});
const adapters = {
    getAdapter: (adapters2) => {
        adapters2 = utils.isArray(adapters2) ? adapters2 : [adapters2];
        const { length } = adapters2;
        let nameOrAdapter;
        let adapter;
        for (let i = 0; i < length; i++) {
            nameOrAdapter = adapters2[i];
            if (adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter) {
                break;
            }
        }
        if (!adapter) {
            if (adapter === false) {
                throw new AxiosError(
                    `Adapter ${nameOrAdapter} is not supported by the environment`,
                    "ERR_NOT_SUPPORT"
                );
            }
            throw new Error(
                utils.hasOwnProp(knownAdapters, nameOrAdapter) ? `Adapter '${nameOrAdapter}' is not available in the build` : `Unknown adapter '${nameOrAdapter}'`
            );
        }
        if (!utils.isFunction(adapter)) {
            throw new TypeError("adapter is not a function");
        }
        return adapter;
    },
    adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
    if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
    }
}
function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = AxiosHeaders$1.from(config.headers);
    config.data = transformData.call(
        config,
        config.transformRequest
    );
    if (["post", "put", "patch"].indexOf(config.method) !== -1) {
        config.headers.setContentType("application/x-www-form-urlencoded", false);
    }
    const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);
    return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        response.data = transformData.call(
            config,
            config.transformResponse,
            response
        );
        response.headers = AxiosHeaders$1.from(response.headers);
        return response;
    }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
            throwIfCancellationRequested(config);
            if (reason && reason.response) {
                reason.response.data = transformData.call(
                    config,
                    config.transformResponse,
                    reason.response
                );
                reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
            }
        }
        return Promise.reject(reason);
    });
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;
function mergeConfig(config1, config2) {
    config2 = config2 || {};
    const config = {};
    function getMergedValue(target, source, caseless) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
            return utils.merge.call({ caseless }, target, source);
        } else if (utils.isPlainObject(source)) {
            return utils.merge({}, source);
        } else if (utils.isArray(source)) {
            return source.slice();
        }
        return source;
    }
    function mergeDeepProperties(a, b, caseless) {
        if (!utils.isUndefined(b)) {
            return getMergedValue(a, b, caseless);
        } else if (!utils.isUndefined(a)) {
            return getMergedValue(void 0, a, caseless);
        }
    }
    function valueFromConfig2(a, b) {
        if (!utils.isUndefined(b)) {
            return getMergedValue(void 0, b);
        }
    }
    function defaultToConfig2(a, b) {
        if (!utils.isUndefined(b)) {
            return getMergedValue(void 0, b);
        } else if (!utils.isUndefined(a)) {
            return getMergedValue(void 0, a);
        }
    }
    function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
            return getMergedValue(a, b);
        } else if (prop in config1) {
            return getMergedValue(void 0, a);
        }
    }
    const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
    };
    utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge2 = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge2(config1[prop], config2[prop], prop);
        utils.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
    });
    return config;
}
const VERSION = "1.4.0";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
    validators$1[type] = function validator2(thing) {
        return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
    };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
    function formatMessage(opt, desc) {
        return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
    }
    return (value, opt, opts) => {
        if (validator2 === false) {
            throw new AxiosError(
                formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
                AxiosError.ERR_DEPRECATED
            );
        }
        if (version && !deprecatedWarnings[opt]) {
            deprecatedWarnings[opt] = true;
            console.warn(
                formatMessage(
                    opt,
                    " has been deprecated since v" + version + " and will be removed in the near future"
                )
            );
        }
        return validator2 ? validator2(value, opt, opts) : true;
    };
};
function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== "object") {
        throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
        const opt = keys[i];
        const validator2 = schema[opt];
        if (validator2) {
            const value = options[opt];
            const result = value === void 0 || validator2(value, opt, options);
            if (result !== true) {
                throw new AxiosError("option " + opt + " must be " + result, AxiosError.ERR_BAD_OPTION_VALUE);
            }
            continue;
        }
        if (allowUnknown !== true) {
            throw new AxiosError("Unknown option " + opt, AxiosError.ERR_BAD_OPTION);
        }
    }
}
const validator = {
    assertOptions,
    validators: validators$1
};
const validators = validator.validators;
class Axios {
    constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
            request: new InterceptorManager$1(),
            response: new InterceptorManager$1()
        };
    }
    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    request(configOrUrl, config) {
        if (typeof configOrUrl === "string") {
            config = config || {};
            config.url = configOrUrl;
        } else {
            config = configOrUrl || {};
        }
        config = mergeConfig(this.defaults, config);
        const { transitional: transitional2, paramsSerializer, headers } = config;
        if (transitional2 !== void 0) {
            validator.assertOptions(transitional2, {
                silentJSONParsing: validators.transitional(validators.boolean),
                forcedJSONParsing: validators.transitional(validators.boolean),
                clarifyTimeoutError: validators.transitional(validators.boolean)
            }, false);
        }
        if (paramsSerializer != null) {
            if (utils.isFunction(paramsSerializer)) {
                config.paramsSerializer = {
                    serialize: paramsSerializer
                };
            } else {
                validator.assertOptions(paramsSerializer, {
                    encode: validators.function,
                    serialize: validators.function
                }, true);
            }
        }
        config.method = (config.method || this.defaults.method || "get").toLowerCase();
        let contextHeaders;
        contextHeaders = headers && utils.merge(
            headers.common,
            headers[config.method]
        );
        contextHeaders && utils.forEach(
            ["delete", "get", "head", "post", "put", "patch", "common"],
            (method) => {
                delete headers[method];
            }
        );
        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
            if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
                return;
            }
            synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
            requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
            responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        let promise;
        let i = 0;
        let len;
        if (!synchronousRequestInterceptors) {
            const chain = [dispatchRequest.bind(this), void 0];
            chain.unshift.apply(chain, requestInterceptorChain);
            chain.push.apply(chain, responseInterceptorChain);
            len = chain.length;
            promise = Promise.resolve(config);
            while (i < len) {
                promise = promise.then(chain[i++], chain[i++]);
            }
            return promise;
        }
        len = requestInterceptorChain.length;
        let newConfig = config;
        i = 0;
        while (i < len) {
            const onFulfilled = requestInterceptorChain[i++];
            const onRejected = requestInterceptorChain[i++];
            try {
                newConfig = onFulfilled(newConfig);
            } catch (error) {
                onRejected.call(this, error);
                break;
            }
        }
        try {
            promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
            return Promise.reject(error);
        }
        i = 0;
        len = responseInterceptorChain.length;
        while (i < len) {
            promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }
        return promise;
    }
    getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
    }
}
utils.forEach(["delete", "get", "head", "options"], function forEachMethodNoData2(method) {
    Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
            method,
            url,
            data: (config || {}).data
        }));
    };
});
utils.forEach(["post", "put", "patch"], function forEachMethodWithData2(method) {
    function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
            return this.request(mergeConfig(config || {}, {
                method,
                headers: isForm ? {
                    "Content-Type": "multipart/form-data"
                } : {},
                url,
                data
            }));
        };
    }
    Axios.prototype[method] = generateHTTPMethod();
    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
const Axios$1 = Axios;
class CancelToken {
    constructor(executor) {
        if (typeof executor !== "function") {
            throw new TypeError("executor must be a function.");
        }
        let resolvePromise;
        this.promise = new Promise(function promiseExecutor(resolve) {
            resolvePromise = resolve;
        });
        const token = this;
        this.promise.then((cancel) => {
            if (!token._listeners)
                return;
            let i = token._listeners.length;
            while (i-- > 0) {
                token._listeners[i](cancel);
            }
            token._listeners = null;
        });
        this.promise.then = (onfulfilled) => {
            let _resolve;
            const promise = new Promise((resolve) => {
                token.subscribe(resolve);
                _resolve = resolve;
            }).then(onfulfilled);
            promise.cancel = function reject() {
                token.unsubscribe(_resolve);
            };
            return promise;
        };
        executor(function cancel(message, config, request) {
            if (token.reason) {
                return;
            }
            token.reason = new CanceledError(message, config, request);
            resolvePromise(token.reason);
        });
    }
    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
        if (this.reason) {
            throw this.reason;
        }
    }
    /**
     * Subscribe to the cancel signal
     */
    subscribe(listener) {
        if (this.reason) {
            listener(this.reason);
            return;
        }
        if (this._listeners) {
            this._listeners.push(listener);
        } else {
            this._listeners = [listener];
        }
    }
    /**
     * Unsubscribe from the cancel signal
     */
    unsubscribe(listener) {
        if (!this._listeners) {
            return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
            cancel = c;
        });
        return {
            token,
            cancel
        };
    }
}
const CancelToken$1 = CancelToken;
function spread(callback) {
    return function wrap(arr) {
        return callback.apply(null, arr);
    };
}
function isAxiosError(payload) {
    return utils.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
    HttpStatusCode[value] = key;
});
const HttpStatusCode$1 = HttpStatusCode;
function createInstance(defaultConfig) {
    const context = new Axios$1(defaultConfig);
    const instance2 = bind(Axios$1.prototype.request, context);
    utils.extend(instance2, Axios$1.prototype, context, { allOwnKeys: true });
    utils.extend(instance2, context, null, { allOwnKeys: true });
    instance2.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };
    return instance2;
}
const axios = createInstance(defaults$1);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData;
axios.AxiosError = AxiosError;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
    return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const axios$1 = axios;
function create_fragment(ctx) {
    let div18;
    let div17;
    let section;
    let form;
    let div4;
    let div3;
    let div0;
    let t1;
    let div2;
    let div1;
    let button;
    let t3;
    let div16;
    let div15;
    let div5;
    let label0;
    let t5;
    let input0;
    let t6;
    let div6;
    let label1;
    let t8;
    let input1;
    let t9;
    let div7;
    let label2;
    let t11;
    let input2;
    let t12;
    let div8;
    let label3;
    let t14;
    let input3;
    let t15;
    let div9;
    let label4;
    let t17;
    let input4;
    let t18;
    let div10;
    let label5;
    let t20;
    let input5;
    let t21;
    let div11;
    let label6;
    let t23;
    let input6;
    let t24;
    let div12;
    let label7;
    let t26;
    let input7;
    let t27;
    let div13;
    let label8;
    let t29;
    let input8;
    let t30;
    let div14;
    let label9;
    let t32;
    let input9;
    let mounted;
    let dispose;
    return {
        c() {
            div18 = element("div");
            div17 = element("div");
            section = element("section");
            form = element("form");
            div4 = element("div");
            div3 = element("div");
            div0 = element("div");
            div0.innerHTML = `<h1>Usage jira configuration</h1>`;
            t1 = space();
            div2 = element("div");
            div1 = element("div");
            button = element("button");
            button.textContent = "submit";
            t3 = space();
            div16 = element("div");
            div15 = element("div");
            div5 = element("div");
            label0 = element("label");
            label0.innerHTML = `Host
                                <span class="aui-icon icon-required"></span>`;
            t5 = space();
            input0 = element("input");
            t6 = space();
            div6 = element("div");
            label1 = element("label");
            label1.innerHTML = `IP
                                <span class="aui-icon icon-required"></span>`;
            t8 = space();
            input1 = element("input");
            t9 = space();
            div7 = element("div");
            label2 = element("label");
            label2.innerHTML = `Port
                                <span class="aui-icon icon-required"></span>`;
            t11 = space();
            input2 = element("input");
            t12 = space();
            div8 = element("div");
            label3 = element("label");
            label3.innerHTML = `Product Code
                                <span class="aui-icon icon-required"></span>`;
            t14 = space();
            input3 = element("input");
            t15 = space();
            div9 = element("div");
            label4 = element("label");
            label4.innerHTML = `Module
                                <span class="aui-icon icon-required"></span>`;
            t17 = space();
            input4 = element("input");
            t18 = space();
            div10 = element("div");
            label5 = element("label");
            label5.innerHTML = `Tenant Code
                                <span class="aui-icon icon-required"></span>`;
            t20 = space();
            input5 = element("input");
            t21 = space();
            div11 = element("div");
            label6 = element("label");
            label6.innerHTML = `User list API URL
                                <span class="aui-icon icon-required"></span>`;
            t23 = space();
            input6 = element("input");
            t24 = space();
            div12 = element("div");
            label7 = element("label");
            label7.innerHTML = `User list API Key
                                <span class="aui-icon icon-required"></span>`;
            t26 = space();
            input7 = element("input");
            t27 = space();
            div13 = element("div");
            label8 = element("label");
            label8.innerHTML = `User count API URL
                                <span class="aui-icon icon-required"></span>`;
            t29 = space();
            input8 = element("input");
            t30 = space();
            div14 = element("div");
            label9 = element("label");
            label9.innerHTML = `User count API Key
                                <span class="aui-icon icon-required"></span>`;
            t32 = space();
            input9 = element("input");
            attr(div0, "class", "aui-page-header-main");
            attr(button, "class", "aui-button");
            attr(button, "id", "save-button");
            attr(button, "type", "button");
            attr(div1, "class", "aui-buttons");
            attr(div2, "class", "aui-page-header-actions");
            attr(div3, "class", "aui-page-header-inner");
            attr(div4, "class", "aui-page-header");
            attr(label0, "for", "host");
            attr(input0, "class", "text");
            attr(input0, "data-aui-validation-field", "");
            attr(input0, "data-aui-validation-required", "required");
            attr(input0, "id", "host");
            attr(input0, "name", "host");
            attr(input0, "type", "text");
            attr(div5, "class", "field-group");
            attr(label1, "for", "ip");
            attr(input1, "class", "text");
            attr(input1, "data-aui-validation-field", "");
            attr(input1, "data-aui-validation-required", "required");
            attr(input1, "id", "ip");
            attr(input1, "name", "ip");
            attr(input1, "type", "text");
            attr(div6, "class", "field-group");
            attr(label2, "for", "port");
            attr(input2, "class", "text");
            attr(input2, "data-aui-validation-field", "");
            attr(input2, "data-aui-validation-required", "required");
            attr(input2, "id", "port");
            attr(input2, "name", "port");
            attr(input2, "type", "text");
            attr(div7, "class", "field-group");
            attr(label3, "for", "product-code");
            attr(input3, "class", "text");
            attr(input3, "data-aui-validation-field", "");
            attr(input3, "data-aui-validation-required", "required");
            attr(input3, "id", "product-code");
            attr(input3, "name", "product-code");
            attr(input3, "type", "text");
            attr(div8, "class", "field-group");
            attr(label4, "for", "module");
            attr(input4, "class", "text");
            attr(input4, "data-aui-validation-field", "");
            attr(input4, "data-aui-validation-required", "required");
            attr(input4, "id", "module");
            attr(input4, "name", "module");
            attr(input4, "type", "text");
            attr(div9, "class", "field-group");
            attr(label5, "for", "tenant-code");
            attr(input5, "class", "text");
            attr(input5, "data-aui-validation-field", "");
            attr(input5, "data-aui-validation-required", "required");
            attr(input5, "id", "tenant-code");
            attr(input5, "name", "tenant-code");
            attr(input5, "type", "text");
            attr(div10, "class", "field-group");
            attr(label6, "for", "user-list-api-url");
            attr(input6, "class", "text");
            attr(input6, "data-aui-validation-field", "");
            attr(input6, "data-aui-validation-required", "required");
            attr(input6, "id", "user-list-api-url");
            attr(input6, "name", "user-list-api-url");
            attr(input6, "type", "text");
            attr(div11, "class", "field-group");
            attr(label7, "for", "user-list-api-key");
            attr(input7, "class", "text");
            attr(input7, "data-aui-validation-field", "");
            attr(input7, "data-aui-validation-required", "required");
            attr(input7, "id", "user-list-api-key");
            attr(input7, "name", "user-list-api-key");
            attr(input7, "type", "text");
            attr(div12, "class", "field-group");
            attr(label8, "for", "user-count-api-url");
            attr(input8, "class", "text");
            attr(input8, "data-aui-validation-field", "");
            attr(input8, "data-aui-validation-required", "required");
            attr(input8, "id", "user-count-api-url");
            attr(input8, "name", "user-count-api-url");
            attr(input8, "type", "text");
            attr(div13, "class", "field-group");
            attr(label9, "for", "user-count-api-key");
            attr(input9, "class", "text");
            attr(input9, "data-aui-validation-field", "");
            attr(input9, "data-aui-validation-required", "required");
            attr(input9, "id", "user-count-api-key");
            attr(input9, "name", "user-count-api-key");
            attr(input9, "type", "text");
            attr(div14, "class", "field-group");
            attr(div15, "class", "form-body");
            attr(div16, "class", "aui-page-panel");
            attr(form, "class", "aui left-label");
            attr(form, "id", "usage-jira-configuration-form");
            attr(div17, "id", "content");
            attr(div18, "id", "page");
        },
        m(target, anchor) {
            insert(target, div18, anchor);
            append(div18, div17);
            append(div17, section);
            append(section, form);
            append(form, div4);
            append(div4, div3);
            append(div3, div0);
            append(div3, t1);
            append(div3, div2);
            append(div2, div1);
            append(div1, button);
            append(form, t3);
            append(form, div16);
            append(div16, div15);
            append(div15, div5);
            append(div5, label0);
            append(div5, t5);
            append(div5, input0);
            set_input_value(
                input0,
                /*configuration*/
                ctx[0].host
            );
            append(div15, t6);
            append(div15, div6);
            append(div6, label1);
            append(div6, t8);
            append(div6, input1);
            set_input_value(
                input1,
                /*configuration*/
                ctx[0].ip
            );
            append(div15, t9);
            append(div15, div7);
            append(div7, label2);
            append(div7, t11);
            append(div7, input2);
            set_input_value(
                input2,
                /*configuration*/
                ctx[0].port
            );
            append(div15, t12);
            append(div15, div8);
            append(div8, label3);
            append(div8, t14);
            append(div8, input3);
            set_input_value(
                input3,
                /*configuration*/
                ctx[0].productCode
            );
            append(div15, t15);
            append(div15, div9);
            append(div9, label4);
            append(div9, t17);
            append(div9, input4);
            set_input_value(
                input4,
                /*configuration*/
                ctx[0].module
            );
            append(div15, t18);
            append(div15, div10);
            append(div10, label5);
            append(div10, t20);
            append(div10, input5);
            set_input_value(
                input5,
                /*configuration*/
                ctx[0].tenantCode
            );
            append(div15, t21);
            append(div15, div11);
            append(div11, label6);
            append(div11, t23);
            append(div11, input6);
            set_input_value(
                input6,
                /*configuration*/
                ctx[0].userListApiUrl
            );
            append(div15, t24);
            append(div15, div12);
            append(div12, label7);
            append(div12, t26);
            append(div12, input7);
            set_input_value(
                input7,
                /*configuration*/
                ctx[0].userListApiKey
            );
            append(div15, t27);
            append(div15, div13);
            append(div13, label8);
            append(div13, t29);
            append(div13, input8);
            set_input_value(
                input8,
                /*configuration*/
                ctx[0].userCountApiUrl
            );
            append(div15, t30);
            append(div15, div14);
            append(div14, label9);
            append(div14, t32);
            append(div14, input9);
            set_input_value(
                input9,
                /*configuration*/
                ctx[0].userCountApiKey
            );
            if (!mounted) {
                dispose = [
                    listen(
                        button,
                        "click",
                        /*updateConfiguration*/
                        ctx[1]
                    ),
                    listen(
                        input0,
                        "input",
                        /*input0_input_handler*/
                        ctx[2]
                    ),
                    listen(
                        input1,
                        "input",
                        /*input1_input_handler*/
                        ctx[3]
                    ),
                    listen(
                        input2,
                        "input",
                        /*input2_input_handler*/
                        ctx[4]
                    ),
                    listen(
                        input3,
                        "input",
                        /*input3_input_handler*/
                        ctx[5]
                    ),
                    listen(
                        input4,
                        "input",
                        /*input4_input_handler*/
                        ctx[6]
                    ),
                    listen(
                        input5,
                        "input",
                        /*input5_input_handler*/
                        ctx[7]
                    ),
                    listen(
                        input6,
                        "input",
                        /*input6_input_handler*/
                        ctx[8]
                    ),
                    listen(
                        input7,
                        "input",
                        /*input7_input_handler*/
                        ctx[9]
                    ),
                    listen(
                        input8,
                        "input",
                        /*input8_input_handler*/
                        ctx[10]
                    ),
                    listen(
                        input9,
                        "input",
                        /*input9_input_handler*/
                        ctx[11]
                    )
                ];
                mounted = true;
            }
        },
        p(ctx2, [dirty]) {
            if (dirty & /*configuration*/
                1 && input0.value !== /*configuration*/
                ctx2[0].host) {
                set_input_value(
                    input0,
                    /*configuration*/
                    ctx2[0].host
                );
            }
            if (dirty & /*configuration*/
                1 && input1.value !== /*configuration*/
                ctx2[0].ip) {
                set_input_value(
                    input1,
                    /*configuration*/
                    ctx2[0].ip
                );
            }
            if (dirty & /*configuration*/
                1 && input2.value !== /*configuration*/
                ctx2[0].port) {
                set_input_value(
                    input2,
                    /*configuration*/
                    ctx2[0].port
                );
            }
            if (dirty & /*configuration*/
                1 && input3.value !== /*configuration*/
                ctx2[0].productCode) {
                set_input_value(
                    input3,
                    /*configuration*/
                    ctx2[0].productCode
                );
            }
            if (dirty & /*configuration*/
                1 && input4.value !== /*configuration*/
                ctx2[0].module) {
                set_input_value(
                    input4,
                    /*configuration*/
                    ctx2[0].module
                );
            }
            if (dirty & /*configuration*/
                1 && input5.value !== /*configuration*/
                ctx2[0].tenantCode) {
                set_input_value(
                    input5,
                    /*configuration*/
                    ctx2[0].tenantCode
                );
            }
            if (dirty & /*configuration*/
                1 && input6.value !== /*configuration*/
                ctx2[0].userListApiUrl) {
                set_input_value(
                    input6,
                    /*configuration*/
                    ctx2[0].userListApiUrl
                );
            }
            if (dirty & /*configuration*/
                1 && input7.value !== /*configuration*/
                ctx2[0].userListApiKey) {
                set_input_value(
                    input7,
                    /*configuration*/
                    ctx2[0].userListApiKey
                );
            }
            if (dirty & /*configuration*/
                1 && input8.value !== /*configuration*/
                ctx2[0].userCountApiUrl) {
                set_input_value(
                    input8,
                    /*configuration*/
                    ctx2[0].userCountApiUrl
                );
            }
            if (dirty & /*configuration*/
                1 && input9.value !== /*configuration*/
                ctx2[0].userCountApiKey) {
                set_input_value(
                    input9,
                    /*configuration*/
                    ctx2[0].userCountApiKey
                );
            }
        },
        i: noop$1,
        o: noop$1,
        d(detaching) {
            if (detaching) {
                detach(div18);
            }
            mounted = false;
            run_all(dispose);
        }
    };
}
const apiUrl = "/jira/rest/usage-jira/1.0/usage-jira-configuration";
function instance($$self, $$props, $$invalidate) {
    let configuration = {
        host: "",
        ip: "",
        port: "",
        productCode: "",
        module: "",
        tenantCode: "",
        userListApiUrl: "",
        userListApiKey: "",
        userCountApiUrl: "",
        userCountApiKey: ""
    };
    onMount(async () => {
        await axios$1.get(apiUrl, {
            auth: { username: "admin", password: "1111" }
        }).then(({ data }) => {
            console.log(data);
            $$invalidate(0, configuration = data);
        });
    });
    function updateConfiguration() {
        console.log("updateConfiguration!!", configuration);
        axios$1.put(apiUrl, configuration, {
            auth: { username: "admin", password: "1111" },
            headers: { "X-Atlassian-Token": "no-check" }
        }).then((response) => {
            console.log("SUCCESS");
        }).catch((e) => {
            console.log("FAIL: ", e);
        });
    }
    function input0_input_handler() {
        configuration.host = this.value;
        $$invalidate(0, configuration);
    }
    function input1_input_handler() {
        configuration.ip = this.value;
        $$invalidate(0, configuration);
    }
    function input2_input_handler() {
        configuration.port = this.value;
        $$invalidate(0, configuration);
    }
    function input3_input_handler() {
        configuration.productCode = this.value;
        $$invalidate(0, configuration);
    }
    function input4_input_handler() {
        configuration.module = this.value;
        $$invalidate(0, configuration);
    }
    function input5_input_handler() {
        configuration.tenantCode = this.value;
        $$invalidate(0, configuration);
    }
    function input6_input_handler() {
        configuration.userListApiUrl = this.value;
        $$invalidate(0, configuration);
    }
    function input7_input_handler() {
        configuration.userListApiKey = this.value;
        $$invalidate(0, configuration);
    }
    function input8_input_handler() {
        configuration.userCountApiUrl = this.value;
        $$invalidate(0, configuration);
    }
    function input9_input_handler() {
        configuration.userCountApiKey = this.value;
        $$invalidate(0, configuration);
    }
    return [
        configuration,
        updateConfiguration,
        input0_input_handler,
        input1_input_handler,
        input2_input_handler,
        input3_input_handler,
        input4_input_handler,
        input5_input_handler,
        input6_input_handler,
        input7_input_handler,
        input8_input_handler,
        input9_input_handler
    ];
}
class App extends SvelteComponent {
    constructor(options) {
        super();
        init(this, options, instance, create_fragment, safe_not_equal, {});
    }
}
new App({
    target: document.getElementById("app")
});
//# sourceMappingURL=index.js.map
