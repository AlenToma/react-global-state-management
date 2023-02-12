var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
    'triggerChange',
    'getProp',
    'stringify',
    'on'
];
var readFromKey = function (str, item) {
    var keys = str.split('.').filter(function (x) { return x.length > 0; });
    var currentItem = item;
    keys.forEach(function (x) {
        if (currentItem !== undefined)
            currentItem = currentItem[x];
    });
    return currentItem;
};
var Identifier = /** @class */ (function () {
    function Identifier(id, data, counter, cols, identifier) {
        this.id = id;
        this.data = data;
        this.counter = counter;
        this.cols = cols && cols.length > 0 ? cols : undefined;
        this.identifier = identifier;
        this.bindValues = new Map();
    }
    Identifier.prototype.bind = function (item) {
        var _this = this;
        this.bindValues.clear();
        if (this.cols)
            this.cols.forEach(function (x) {
                if (x.indexOf('.') !== -1) {
                    var value = readFromKey(x, item);
                    if (!(typeof value == 'object' || typeof value == 'function'))
                        _this.bindValues.set(x, value);
                }
            });
        return this;
    };
    Identifier.prototype.addIdentifier = function (identifier) {
        this.identifier = identifier;
    };
    return Identifier;
}());
var ids = new Map();
var uid = function (sId) {
    if (!sId)
        sId = '';
    var id = Date.now().toString(36) + Math.random().toString(36).substring(2) + sId;
    if (ids.has(id))
        return uid(id);
    ids.set(id, id);
    return id;
};
var Methods = /** @class */ (function () {
    function Methods(disableTimer, onChange) {
        this.events = [];
        this.hooks = [];
        this.execludedKeys = undefined;
        this.disableTimer = disableTimer;
        this.onChange = onChange;
        this.keyType = new Map();
        this.funcs = new Map();
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
        if (!alreadyCloned)
            alreadyCloned = new Map();
        var item = tItem;
        try {
            if (!parentKey)
                parentKey = '';
            var prKey_1 = function (key) {
                if (parentKey != '')
                    return parentKey + '.' + key;
                return key;
            };
            var readablePrKey_1 = function (key, clean) {
                if (clean !== false)
                    return prKey_1(key).replace(/\./g, '');
                else
                    return prKey_1(key);
            };
            var readableParentKey_1 = function (key, clean) {
                if (key.indexOf('.') != -1) {
                    return key
                        .split('.')
                        .reverse()
                        .filter(function (_, i) { return i > 0; })
                        .reverse()
                        .join(clean !== false ? undefined : '.');
                }
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
                        var diffValues_1 = function (e, key0) {
                            var n = readFromKey(key0, _this);
                            if (!e.bindValues.has(key0))
                                return false;
                            if (e.bindValues.get(key0) !== n)
                                return true;
                            return false;
                        };
                        var keyIncluded = function (e) {
                            for (var _i = 0, _a = e.cols || []; _i < _a.length; _i++) {
                                var c = _a[_i];
                                if (c === key)
                                    return true;
                                if (c.indexOf('.') != -1 &&
                                    c.indexOf(key) != -1 &&
                                    diffValues_1(e, c))
                                    return true;
                                if (key.indexOf('.') != -1 && key.indexOf(c) != -1)
                                    return true;
                            }
                            return false;
                        };
                        var _loop_2 = function (e) {
                            var add = true;
                            if (e.cols && !keyIncluded(e)) {
                                add = false;
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
                            if (e.cols && !keyIncluded(e)) {
                                add = false;
                            }
                            if (add)
                                hooks_1.push(e);
                        }
                        var fn_1 = function () {
                            var _a;
                            (_a = methods_1.onChange) === null || _a === void 0 ? void 0 : _a.call(methods_1, _this, propsChanged_1);
                            caller_1.forEach(function (x) {
                                x.e.data(_this, x.props);
                            });
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
                keys = __spreadArray(__spreadArray([], keys, true), Object.getOwnPropertyNames(prototype), true).filter(function (x) { return !ignoreKyes_1.includes(x); });
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
                    if (Array.isArray(execludedKeys)) {
                        if (execludedKeys.includes(readablePrKey_1(key)) ||
                            execludedKeys.includes(readableParentKey_1(key)))
                            r = true;
                    }
                    else if ((readablePrKey_1(key) != '' && execludedKeys(readablePrKey_1(key, false))))
                        r = true;
                    else if ((readableParentKey_1(key) != '' && execludedKeys(readableParentKey_1(key, false))))
                        r = true;
                }
                return r;
            };
            var setType_1 = function (key, val) {
                if (val === undefined ||
                    val === null ||
                    _this.getProp().keyType.has(key))
                    return;
                var valueType = typeof val;
                if (Array.isArray(val) && valueType == 'object') {
                    valueType = 'array';
                }
                _this.getProp().keyType.set(key, valueType);
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
    GlobalState.prototype.subscribe = function (func) {
        var _this = this;
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        try {
            var rAny = React;
            var ref_1 = rAny.useRef(0);
            var events_2 = this.getProp().events;
            if (ref_1.current === 0) {
                ref_1.current = uid();
                var event_1 = new Identifier(ref_1.current, function (item, props) {
                    var _a;
                    try {
                        (_a = events_2.find(function (x) { return x.id == event_1.id; })) === null || _a === void 0 ? void 0 : _a.bind(_this);
                        func(item, props);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }, 0, items);
                if (!events_2.find(function (x) { return x.id == event_1.id; }))
                    events_2.push(event_1.bind(this));
            }
            else {
                var e = events_2.find(function (x) { return x.id === ref_1.current; });
                if (e)
                    e.data = func;
            }
            rAny.useEffect(function () {
                return function () {
                    _this.unsubscribe(ref_1.current);
                    ids["delete"](ref_1.current);
                };
            }, []);
            return events_2.find(function (x) { return x.id == ref_1.current; });
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    GlobalState.prototype.on = function (col, func) {
        var _this = this;
        var rAny = React;
        var _a = rAny.useState(0), counter = _a[0], setCounter = _a[1];
        this.subscribe(function () {
            var value = readFromKey(col, _this);
            if (func(value)) {
                setCounter(counter + 1);
            }
        }, col);
    };
    GlobalState.prototype.hook = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        try {
            var rAny = React;
            var _a = rAny.useState(0), counter = _a[0], setCounter_1 = _a[1];
            var ref_2 = rAny.useRef(0);
            if (ref_2.current === 0) {
                ref_2.current = uid();
            }
            this.addHook(new Identifier(ref_2.current, function (v) {
                var _a;
                try {
                    (_a = _this.getProp()
                        .hooks.find(function (x) { return x.id == ref_2.current; })) === null || _a === void 0 ? void 0 : _a.bind(_this);
                    setCounter_1(v);
                }
                catch (e) {
                    console.warn('Component is unmounted');
                    _this.removeHook(ref_2.current);
                }
            }, counter, items));
            rAny.useEffect(function () {
                return function () {
                    _this.removeHook(ref_2.current);
                    ids["delete"](ref_2.current);
                };
            }, []);
            return this.getProp().hooks.find(function (x) { return x.id == ref_2.current; });
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    GlobalState.prototype.triggerChange = function (toOnChange) {
        var _this = this;
        var _a;
        var identifiers = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            identifiers[_i - 1] = arguments[_i];
        }
        var methods = this.getProp();
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
        for (var _b = 0, events_3 = events; _b < events_3.length; _b++) {
            var e = events_3[_b];
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
        cEvents.forEach(function (x) { return x.e.data(_this, x.props); });
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
            items.push(value.bind(this));
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
    methods.execludedKeys = execludeComponentsFromMutations
        ? Array.isArray(execludeComponentsFromMutations)
            ? getColumns(('function ' + execludeComponentsFromMutations))
            : execludeComponentsFromMutations
        : [];
    return new GlobalState(item, id);
});
//# sourceMappingURL=index.js.map