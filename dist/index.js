var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as React from 'react';
import createArray from './CustomArray';
import toJSON from './toJson';
import { defineProp, defineMethod } from './defineProp';
var __ignoreKeys = [
    'hook',
    'getEvents',
    'subscribe',
    'unsubscribe',
    'addHook',
    'removeHook',
];
var toKeyValue = function (v) {
    if (v == undefined || v == null)
        return undefined;
    try {
        if (typeof v === 'object' && typeof v != 'string')
            return toJSON(v);
        else
            return v.toString();
    }
    catch (e) {
        console.error(e);
        return v.toString();
    }
};
var clone = function (item, old) {
    if (item === undefined || item == null) {
        if (old && Array.isArray(old))
            return [];
        return {};
    }
    if (typeof item === 'object' && !Array.isArray(item))
        return __assign({}, item);
    return item;
};
var Identifier = /** @class */ (function () {
    function Identifier(id, data, counter, cols, identifier) {
        this.id = id;
        this.data = data;
        this.counter = counter;
        this.cols = cols;
        this.identifier = identifier;
    }
    Identifier.prototype.init = function (parent) {
        try {
            if (this.cols)
                this.json = toKeyValue(this.cols(parent));
        }
        catch (e) {
            console.error(e);
        }
        return this;
    };
    return Identifier;
}());
var ids = new Map();
var uid = function (sId) {
    if (!sId)
        sId = "";
    var id = Date.now().toString(36) + Math.random().toString(36).substring(2) + sId;
    if (ids.has(id))
        return uid(id);
    ids.set(id, id);
    return id;
};
var Methods = /** @class */ (function () {
    function Methods(disableTimer, onChange) {
        this.dummes = undefined;
        this.events = [];
        this.hooks = [];
        this.execludedKeys = [];
        this.disableTimer = disableTimer;
        this.onChange = onChange;
        this.keyType = new Map();
    }
    return Methods;
}());
var __Properties = new Map();
var assign = function (item, id) {
    defineMethod(item, 'isGlobalState', function () { return true; });
    defineProp(item, '____id', id);
};
/**
 * @type Class
 */
var GlobalState = /** @class */ (function () {
    function GlobalState(tItem, id, trigger, parentKey, alreadyCloned) {
        var _this = this;
        var $thisAny = this;
        if ($thisAny.____id === undefined)
            assign(this, id);
        if (this.getProp().dummes == undefined)
            this.getProp().dummes = JSON.parse(toJSON(tItem));
        if (!alreadyCloned)
            alreadyCloned = new Map();
        var item = tItem;
        var dummes = this.getProp().dummes;
        try {
            if (!parentKey)
                parentKey = '';
            var prKey_1 = function (key) {
                if (parentKey != '')
                    return parentKey + '.' + key;
                return key;
            };
            var readablePrKey_1 = function (key) { return prKey_1(key).replace(/\./g, ''); };
            var readableParentKey_1 = function (key) {
                if (key.indexOf('.') != -1)
                    return key
                        .split('.')
                        .reverse()
                        .filter(function (_, i) { return i > 0; })
                        .reverse()
                        .join();
                return '';
            };
            var timer_1 = undefined;
            var caller_1 = [];
            var hooks_1 = [];
            var propsChanged_1 = [];
            if (!trigger)
                trigger = function (key, oldValue, newValue) {
                    var _a;
                    try {
                        var methods_1 = _this.getProp();
                        var prop = { key: key, oldValue: oldValue, newValue: newValue };
                        propsChanged_1.push(prop);
                        if (!methods_1.disableTimer)
                            clearTimeout(timer_1);
                        var events = methods_1.events;
                        var _loop_2 = function (e) {
                            var add = true;
                            if (e.cols) {
                                var s1 = toKeyValue(e.cols(dummes));
                                if (s1 === e.json)
                                    add = false;
                                e.json = s1;
                            }
                            if (add) {
                                if (caller_1.find(function (x) { return x.e == e; }))
                                    (_a = caller_1.find(function (x) { return x.e == e; })) === null || _a === void 0 ? void 0 : _a.props.push(prop);
                                else
                                    caller_1.push({ props: [prop], e: e });
                            }
                        };
                        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                            var e = events_1[_i];
                            _loop_2(e);
                        }
                        for (var _b = 0, _c = methods_1.hooks; _b < _c.length; _b++) {
                            var e = _c[_b];
                            var add = true;
                            if (e.cols) {
                                var s1 = toKeyValue(e.cols(dummes));
                                if (s1 === e.json)
                                    add = false;
                                e.json = s1;
                            }
                            if (add)
                                hooks_1.push(e);
                        }
                        var fn_1 = function () {
                            var _a;
                            (_a = methods_1.onChange) === null || _a === void 0 ? void 0 : _a.call(methods_1, _this, propsChanged_1);
                            caller_1.forEach(function (x) { return x.e.data(dummes, x.props); });
                            hooks_1.forEach(function (x) {
                                x.data(x.counter + 1);
                            });
                            caller_1 = [];
                            hooks_1 = [];
                            propsChanged_1.splice(0, propsChanged_1.length);
                        };
                        if (!methods_1.disableTimer)
                            timer_1 = setTimeout(function () {
                                fn_1();
                            }, 0);
                        else
                            fn_1();
                    }
                    catch (e) {
                        console.error(e);
                    }
                };
            var keys = Object.keys(item).filter(function (x) { return !__ignoreKeys.includes(x); });
            var prototype = Object.getPrototypeOf(item);
            if (prototype !== undefined && prototype != null) {
                var ignoreKyes_1 = Object.getOwnPropertyNames(Object.prototype);
                keys = __spreadArrays(keys, Object.getOwnPropertyNames(prototype)).filter(function (x) { return !ignoreKyes_1.includes(x); });
            }
            var onCreate_1 = function (key, data) {
                if (!alreadyCloned)
                    alreadyCloned = new Map();
                var r = [];
                if (typeof data === 'string')
                    data = [data];
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var x = data_1[_i];
                    if (x) {
                        if (Array.isArray(x) && typeof x !== 'string') {
                            r.push(createArray(x, onCreate_1, trigger, key));
                        }
                        else {
                            if (typeof x === 'object' &&
                                !Array.isArray(x) &&
                                typeof x !== 'string' &&
                                !isExecluded_1(key)) {
                                alreadyCloned.set(x, x);
                                alreadyCloned.set(x, new GlobalState(x, id, trigger, key, alreadyCloned));
                                r.push(alreadyCloned.get(x));
                            }
                            else
                                r.push(x);
                        }
                    }
                    else
                        r.push(x);
                }
                return r;
            };
            var isExecluded_1 = function (key) {
                var execludedKeys = _this.getProp().execludedKeys;
                var r = false;
                if (execludedKeys === undefined)
                    r = false;
                else {
                    if (execludedKeys.includes(readablePrKey_1(key)) ||
                        execludedKeys.includes(readableParentKey_1(key)))
                        r = true;
                }
                return r;
            };
            var setType_1 = function (key, val) {
                if (val === undefined || val === null || _this.getProp().keyType.has(key))
                    return;
                var valueType = typeof val;
                if (Array.isArray(val) && valueType == "object") {
                    valueType = "array";
                }
                _this.getProp().keyType.set(key, valueType);
            };
            var setDummes_1 = function (key, value) {
                var fn = undefined;
                var fnText = '';
                if (value && typeof value === 'object')
                    value = JSON.parse(toJSON(value));
                try {
                    if (key.indexOf('.') === -1)
                        fn = new Function('x', "i", 'value', "x." + key + " = value");
                    else {
                        var keys_2 = key.split('.');
                        var k_1 = 'x.';
                        keys_2.forEach(function (x, i) {
                            if (i < key.length - 1 && keys_2[i + 1] != undefined) {
                                k_1 += x;
                                var nextKey = keys_2[i + 1];
                                fnText += "\n                        if (" + k_1 + " === undefined || " + k_1 + " === null){\n                                  if((!i.has(\"" + k_1 + "\".substring(1)) || i.get(\"" + k_1 + "\".substring(1)) == \"object\"))\n                                      " + k_1 + " = {" + nextKey + ":undefined}\n                                  else if (i.get(\"" + k_1 + "\".substring(1)) == \"array\") " + k_1 + " = [];\n                                  else " + k_1 + " = undefined;\n                                 }\n                                ";
                                k_1 += '.';
                            }
                            else {
                                k_1 += x;
                                fnText += k_1 + "= value";
                            }
                        });
                        fn = new Function('x', "i", 'value', fnText);
                    }
                    fn(dummes, _this.getProp().keyType, value);
                }
                catch (e) {
                    console.error(e);
                    console.info(fnText);
                }
            };
            var _loop_1 = function (key) {
                try {
                    var val_1 = item[key];
                    if (typeof val_1 === 'object' &&
                        !Array.isArray(val_1) &&
                        val_1 !== undefined &&
                        val_1 !== null &&
                        typeof val_1 !== 'string') {
                        if (!isExecluded_1(key)) {
                            if (!alreadyCloned.has(val_1)) {
                                alreadyCloned.set(val_1, val_1);
                                alreadyCloned.set(val_1, new GlobalState(val_1, id, trigger.bind(this_1), prKey_1(key), alreadyCloned));
                                val_1 = alreadyCloned.get(val_1);
                            }
                            else
                                val_1 = alreadyCloned.get(val_1);
                        }
                    }
                    else if (val_1 && Array.isArray(val_1) && typeof val_1 !== 'string') {
                        val_1 = createArray(val_1, onCreate_1.bind(this_1), trigger === null || trigger === void 0 ? void 0 : trigger.bind(this_1), prKey_1(key));
                    }
                    setType_1(prKey_1(key), val_1);
                    Object.defineProperty(this_1, key, {
                        get: function () { return val_1; },
                        set: function (value) {
                            try {
                                var oValue = value;
                                if (value == val_1)
                                    return;
                                if (value && !value.isGlobalState)
                                    alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned["delete"](oValue);
                                if (typeof value === 'object' &&
                                    !Array.isArray(value) &&
                                    value !== undefined &&
                                    value !== null &&
                                    typeof value !== 'string') {
                                    if (!isExecluded_1(key) && !value.isGlobalState) {
                                        alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned.set(value, value);
                                        alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned.set(value, new GlobalState(oValue, id, trigger === null || trigger === void 0 ? void 0 : trigger.bind(_this), prKey_1(key), alreadyCloned));
                                        value = alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned.get(value);
                                    }
                                }
                                else if (value &&
                                    Array.isArray(value) &&
                                    typeof value !== 'string') {
                                    value = createArray(oValue, onCreate_1.bind(_this), trigger === null || trigger === void 0 ? void 0 : trigger.bind(_this), prKey_1(key));
                                }
                                var oldValue = item[key];
                                item[key] = oValue;
                                setType_1(prKey_1(key), oValue);
                                setDummes_1(prKey_1(key), clone(oValue, oldValue));
                                val_1 = value;
                                if (trigger && value !== oldValue) {
                                    trigger(prKey_1(key), oldValue, value);
                                }
                            }
                            catch (e) {
                                console.error(e);
                                throw e;
                            }
                        },
                        enumerable: true
                    });
                }
                catch (e) {
                    console.error(prKey_1(key), e);
                    console.info(prKey_1(key), 'wont be included in GlobalState');
                }
            };
            var this_1 = this;
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                _loop_1(key);
            }
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    GlobalState.prototype.getProp = function () {
        if (!__Properties.has(this.____id))
            __Properties.set(this.____id, new Methods(false));
        return __Properties.get(this.____id);
    };
    GlobalState.prototype.stringify = function () {
        return toJSON(this);
    };
    GlobalState.prototype.subscribe = function (func, items, identifier) {
        var _this = this;
        try {
            var rAny = React;
            var ref_1 = rAny.useRef(0);
            var events = this.getProp().events;
            if (ref_1.current === 0) {
                ref_1.current = uid();
                var event_1 = new Identifier(ref_1.current, func, 0, items, identifier);
                if (!events.find(function (x) { return x.id == event_1.id; }))
                    events.push(event_1.init(this.getProp().dummes));
            }
            else {
                var e = events.find(function (x) { return x.id === ref_1.current; });
                if (e)
                    e.data = func;
            }
            rAny.useEffect(function () {
                return function () {
                    _this.unsubscribe(ref_1.current);
                    ids["delete"](ref_1.current);
                };
            }, []);
            return this;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    GlobalState.prototype.hook = function (items, identifier) {
        var _this = this;
        try {
            var rAny = React;
            var _a = rAny.useState(0), counter = _a[0], setCounter = _a[1];
            var ref_2 = rAny.useRef(0);
            if (ref_2.current === 0) {
                ref_2.current = uid();
            }
            this.addHook(new Identifier(ref_2.current, setCounter, counter, items, identifier));
            rAny.useEffect(function () {
                return function () {
                    _this.removeHook(ref_2.current);
                    ids["delete"](ref_2.current);
                };
            }, []);
            return this;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    GlobalState.prototype.triggerChange = function (toOnChange) {
        var _a;
        var identifiers = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            identifiers[_i - 1] = arguments[_i];
        }
        var methods = this.getProp();
        var dummes = methods.dummes;
        var events = methods.events;
        var hooks = methods.hooks;
        var cEvents = [];
        var chooks = [];
        var _loop_3 = function (e) {
            var add = true;
            if (identifiers.length > 0 &&
                (!e.identifier || !identifiers.includes(e.identifier))) {
                add = false;
            }
            if (add) {
                if (!cEvents.find(function (x) { return x.e == e; }))
                    cEvents.push({ props: [], e: e });
            }
        };
        for (var _b = 0, events_2 = events; _b < events_2.length; _b++) {
            var e = events_2[_b];
            _loop_3(e);
        }
        for (var _c = 0, hooks_2 = hooks; _c < hooks_2.length; _c++) {
            var e = hooks_2[_c];
            var add = true;
            if (identifiers.length > 0 &&
                (!e.identifier || !identifiers.includes(e.identifier))) {
                add = false;
            }
            if (add)
                chooks.push(e);
        }
        if (toOnChange)
            (_a = methods.onChange) === null || _a === void 0 ? void 0 : _a.call(methods, this, []);
        cEvents.forEach(function (x) { return x.e.data(dummes, x.props); });
        chooks.forEach(function (x) {
            x.data(x.counter + 1);
        });
    };
    GlobalState.prototype.unsubscribe = function (item) {
        var events = this.getProp().events;
        if (events.find(function (x) { return x.id === item; }))
            events.splice(events.findIndex(function (x) { return x.id == item; }), 1);
    };
    GlobalState.prototype.addHook = function (value) {
        var items = this.getProp().hooks;
        var addValue = true;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var c = items_1[_i];
            if (c.id == value.id) {
                c.data = value.data;
                c.counter = value.counter;
                addValue = false;
                break;
            }
        }
        if (addValue)
            items.push(value.init(this.getProp().dummes));
    };
    GlobalState.prototype.removeHook = function (value) {
        var item = this.getProp().hooks;
        if (item && item.find(function (x) { return x.id === value; }))
            item.splice(item.indexOf(item.find(function (x) { return x.id === value; })), 1);
    };
    return GlobalState;
}());
var getColumns = function (fn, skipFirst) {
    var str = fn.toString().replace(/\"|\'/gim, '');
    var colName = '';
    if (str.indexOf('(') !== -1 && str.indexOf(')') && skipFirst !== false) {
        colName = str.substring(str.indexOf('(') + 1, str.indexOf(')')).trim();
    }
    if (str.indexOf(')') !== -1)
        str = str.substring(str.indexOf(')'));
    str = str
        .replace(/\]|'|"|\+|return|;|\=|\>|\.|\}|\{|\(|\)|\[|function| /gim, '')
        .replace(/\r?\n|\r/g, '');
    if (colName != '') {
        return str.split(',').map(function (x) {
            x = x.trim();
            if (x.indexOf(colName) === 0)
                return x.substring(colName.length);
            return x;
        });
    }
    return str.split(',');
};
export default (function (item, execludeComponentsFromMutations, disableTimer, onChange) {
    var id = uid();
    var methods = new Methods(disableTimer !== null && disableTimer !== void 0 ? disableTimer : false, onChange);
    __Properties.set(id, methods);
    methods.execludedKeys = execludeComponentsFromMutations ? getColumns(execludeComponentsFromMutations) : [];
    return new GlobalState(item, id);
});
//# sourceMappingURL=index.js.map