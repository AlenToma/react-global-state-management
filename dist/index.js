var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as React from 'react';
import createArray from './CustomArray';
var __ignoreKeys = [
    'hook',
    'getEvents',
    'subscribe',
    'unsubscribe',
    'addHook',
    'removeHook',
];
var __events = new Map();
var __hooks = new Map();
var ids = { id: 0 };
var GlobalState = /** @class */ (function () {
    function GlobalState(tItem, trigger, parentKey, execludeComponentsFromMutations, alreadyCloned) {
        var _this = this;
        this.isGlobalState = function () {
            return true;
        };
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
            var readablePrKey_1 = function (key) { return prKey_1(key).replace(/\./g, ''); };
            var readableParentKey_1 = function (key) {
                if (key.indexOf('.') != -1)
                    return key
                        .split('.')
                        .reverse()
                        .filter(function (_, i) { return i > 0; })
                        .reverse()
                        .join();
                return key;
            };
            var timer_1 = undefined;
            var caller_1 = [];
            var hooks_1 = [];
            if (!trigger)
                trigger = function (key, oldValue, newValue) {
                    var _a;
                    var isArray = false;
                    var arrKey = '';
                    var isArrayParent = function () {
                        var t = undefined;
                        for (var _i = 0, _a = key.split('.'); _i < _a.length; _i++) {
                            var x = _a[_i];
                            t = item[x];
                            arrKey += x;
                            if (t && Array.isArray(t)) {
                                isArray = true;
                                break;
                            }
                        }
                    };
                    isArrayParent();
                    clearTimeout(timer_1);
                    var events = _this.getEvents();
                    var func = new Function("return [" + key + "]");
                    var ck = getColumns(func, false)[0];
                    var _loop_2 = function (e) {
                        var props = { key: key, oldValue: oldValue, newValue: newValue };
                        if (e[1].items.includes(ck) ||
                            (isArray && e[1].items.includes(arrKey)) ||
                            e[1].items.includes(readableParentKey_1(key)) ||
                            e[1].items.length == 0) {
                            if (!caller_1.find(function (x) { return x.item == e[1]; }))
                                caller_1.push({ item: e[1], props: [props] });
                            else
                                (_a = caller_1.find(function (x) { return x.item == e[1]; })) === null || _a === void 0 ? void 0 : _a.props.push(props);
                        }
                    };
                    for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                        var e = events_1[_i];
                        _loop_2(e);
                    }
                    for (var _b = 0, _c = __hooks.get(_this) || []; _b < _c.length; _b++) {
                        var e = _c[_b];
                        if ((e[3].includes(ck) ||
                            (isArray && e[3].includes(arrKey)) ||
                            e[3].includes(readableParentKey_1(key)) ||
                            e[3].length == 0) &&
                            !hooks_1.includes(e))
                            hooks_1.push(e);
                    }
                    timer_1 = setTimeout(function () {
                        caller_1.forEach(function (x) { return x.item.func(_this, x.props); });
                        hooks_1.forEach(function (x) {
                            x[0] = x[0] + 1;
                            x[1](x[0]);
                        });
                        caller_1 = [];
                        hooks_1 = [];
                    }, 100);
                };
            var keys = Object.keys(item).filter(function (x) { return !__ignoreKeys.includes(x); });
            var prototype = Object.getPrototypeOf(item);
            if (prototype !== undefined && prototype != null) {
                var ignoreKyes_1 = Object.getOwnPropertyNames(Object.prototype);
                keys = __spreadArrays(keys, Object.getOwnPropertyNames(prototype)).filter(function (x) { return !ignoreKyes_1.includes(x); });
            }
            var onCreate_1 = function (key, data, execludeComponentsFromMutation) {
                if (!alreadyCloned)
                    alreadyCloned = new Map();
                var r = [];
                if (typeof data === 'string')
                    data = [data];
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var x = data_1[_i];
                    if (x) {
                        if (Array.isArray(x) && typeof x !== 'string') {
                            if ((x.length > 0 && x.getType == undefined) ||
                                x.getType() != 'CustomeArray')
                                createArray(x, onCreate_1.bind(_this)).forEach(function (a) { return r.push(a); }, trigger, key, execludeComponentsFromMutation);
                        }
                        else {
                            if (typeof x === 'object' &&
                                !Array.isArray(x) &&
                                typeof x !== 'string' &&
                                !isExecluded_1(key)) {
                                alreadyCloned.set(x, x);
                                alreadyCloned.set(x, new GlobalState(x, trigger, prKey_1(key), execludeComponentsFromMutation, alreadyCloned));
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
                if (!execludeComponentsFromMutations)
                    return false;
                if (execludeComponentsFromMutations.includes(readablePrKey_1(key)) ||
                    (parentKey && execludeComponentsFromMutations.includes(parentKey)))
                    return true;
                return false;
            };
            var _loop_1 = function (key) {
                var val = item[key];
                if (typeof val === 'object' &&
                    !Array.isArray(val) &&
                    val !== undefined &&
                    val !== null &&
                    typeof val !== 'string') {
                    if (!isExecluded_1(key)) {
                        if (!alreadyCloned.has(val)) {
                            alreadyCloned.set(val, val);
                            alreadyCloned.set(val, new GlobalState(val, trigger, prKey_1(key), execludeComponentsFromMutations, alreadyCloned));
                            val = alreadyCloned.get(val);
                        }
                        else
                            val = alreadyCloned.get(val);
                    }
                }
                else if (val && Array.isArray(val) && typeof val !== 'string') {
                    val = createArray(val, onCreate_1.bind(this_1), trigger === null || trigger === void 0 ? void 0 : trigger.bind(this_1), key, execludeComponentsFromMutations);
                }
                Object.defineProperty(this_1, key, {
                    get: function () { return val; },
                    set: function (value) {
                        var oValue = value;
                        if (value == val)
                            return;
                        if (!value.isGlobalState)
                            alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned["delete"](oValue);
                        if (typeof value === 'object' &&
                            !Array.isArray(value) &&
                            value !== undefined &&
                            value !== null &&
                            typeof value !== 'string') {
                            if (!isExecluded_1(key) && !value.isGlobalState) {
                                alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned.set(value, value);
                                alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned.set(value, new GlobalState(oValue, trigger, prKey_1(key), execludeComponentsFromMutations, alreadyCloned));
                                value = alreadyCloned === null || alreadyCloned === void 0 ? void 0 : alreadyCloned.get(value);
                            }
                        }
                        else if (value &&
                            Array.isArray(value) &&
                            typeof value !== 'string') {
                            value = createArray(oValue, onCreate_1.bind(_this), trigger === null || trigger === void 0 ? void 0 : trigger.bind(_this), key, execludeComponentsFromMutations);
                        }
                        var oldValue = item[key];
                        item[key] = oValue;
                        val = value;
                        if (trigger && value !== oldValue)
                            trigger(prKey_1(key), oldValue, value);
                    },
                    enumerable: true
                });
            };
            var this_1 = this;
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                _loop_1(key);
            }
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }
    GlobalState.prototype.subscribe = function (func, items) {
        var _this = this;
        var rAny = React;
        var ref = rAny.useRef(0);
        var events = this.getEvents();
        var event = new EventSubscriper(func, items);
        if (ref.current === 0) {
            ref.current = ++ids.id;
            events.push([ref.current, event]);
        }
        else {
            var e = events.find(function (x) { return x[0] === ref.current; });
            if (e)
                e[1].func = func;
        }
        rAny.useEffect(function () {
            return function () {
                _this.unsubscribe(ref.current);
            };
        }, []);
        return this.getEvents()[this.getEvents().length - 1];
    };
    GlobalState.prototype.hook = function (items) {
        var _this = this;
        var rAny = React;
        var _a = rAny.useState(0), counter = _a[0], setCounter = _a[1];
        var ref = rAny.useRef(0);
        if (ref.current === 0) {
            ref.current = ++ids.id;
        }
        this.addHook([
            counter,
            setCounter.bind(counter),
            ref.current,
            items ? getColumns(items) : [],
        ]);
        rAny.useEffect(function () {
            return function () {
                _this.removeHook(ref.current);
            };
        }, []);
    };
    GlobalState.prototype.unsubscribe = function (item) {
        var events = this.getEvents();
        if (events.find(function (x) { return x[0] === item; }))
            events.splice(events.findIndex(function (x) { return x[0] == item; }), 1);
    };
    GlobalState.prototype.addHook = function (value) {
        if (!__hooks.get(this))
            __hooks.set(this, []);
        var item = __hooks.get(this);
        var addValue = true;
        for (var _i = 0, _a = item; _i < _a.length; _i++) {
            var c = _a[_i];
            if (c[2] == value[2]) {
                c[1] == value[1];
                c[0] == value[0];
                addValue = false;
                break;
            }
        }
        if (addValue && item)
            item.push(value);
    };
    GlobalState.prototype.removeHook = function (value) {
        var item = __hooks.get(this);
        if (item && item.find(function (x) { return x[2] === value; }))
            item.splice(item.indexOf(item.find(function (x) { return x[2] === value; })), 1);
    };
    GlobalState.prototype.getEvents = function () {
        if (!__events.get(this))
            __events.set(this, []);
        var item = __events.get(this);
        return item;
    };
    return GlobalState;
}());
var getColumns = function (fn, skipFirst) {
    var str = fn.toString();
    var colName = '';
    if (str.indexOf('.') !== -1 && skipFirst !== false) {
        colName = str
            .substring(str.indexOf('['), str.indexOf('.'))
            .replace('[', '');
    }
    if (str.indexOf('[') !== -1) {
        str = str.substring(str.indexOf('[') + 1);
    }
    str = str
        .replace(/\]|'|"|\+|return|;|\.|\}|\{|\(|\)|function| /gim, '')
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
var EventSubscriper = /** @class */ (function () {
    function EventSubscriper(func, items) {
        this.func = func;
        if (items)
            this.items = getColumns(items);
        else
            this.items = [];
    }
    return EventSubscriper;
}());
export default (function (item, execludeComponentsFromMutations) {
    console.log('create global');
    return new GlobalState(item, undefined, undefined, execludeComponentsFromMutations
        ? getColumns(execludeComponentsFromMutations)
        : undefined);
});
//# sourceMappingURL=index.js.map