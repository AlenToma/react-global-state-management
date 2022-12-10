var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { defineMethod } from './defineProp';
export default function createData(dt, onCreate, trigger, key) {
    var pr = Array.prototype;
    var prCopy = new Array();
    var created = false;
    defineMethod(prCopy, 'getKey', function () { return key; });
    defineMethod(prCopy, 'getType', function () { return 'CustomeArray'; });
    defineMethod(prCopy, 'push', function () {
        var _a;
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        var oValue = __spreadArrays(this);
        var r = (_a = pr.push).call.apply(_a, __spreadArrays([this], onCreate(this.getKey(), data)));
        if (oValue.length !== this.length && created)
            trigger(this.getKey(), oValue, this);
        return r;
    });
    defineMethod(prCopy, 'concat', function () {
        var _a;
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        return (_a = pr.concat).call.apply(_a, __spreadArrays([this], onCreate(this.getKey(), data)));
    });
    defineMethod(prCopy, 'shift', function () {
        var oValue = __spreadArrays(this);
        var r = pr.shift.call(this);
        if (oValue.length !== this.length)
            trigger(this.getKey(), oValue, this);
        return r;
    });
    defineMethod(prCopy, 'unshift', function () {
        var _a;
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        var oValue = __spreadArrays(this);
        var r = (_a = pr.unshift).call.apply(_a, __spreadArrays([this], onCreate(this.getKey(), data)));
        if (oValue.length !== this.length)
            trigger(this.getKey(), oValue, this);
        return r;
    });
    defineMethod(prCopy, 'pop', function () {
        var oValue = __spreadArrays(this);
        var r = pr.pop.call(this);
        if (oValue.length !== this.length)
            trigger(this.getKey(), oValue, this);
        return r;
    });
    defineMethod(prCopy, 'slice', function (start, end) {
        var oValue = __spreadArrays(this);
        var r = pr.slice.call(this, start, end);
        trigger(this.getKey(), oValue, this);
        return r;
    });
    defineMethod(prCopy, 'slice', function (start, deleteCount) {
        var _a;
        var data = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            data[_i - 2] = arguments[_i];
        }
        var oValue = __spreadArrays(this);
        var r = (_a = pr.splice).call.apply(_a, __spreadArrays([this,
            start,
            deleteCount], onCreate(this.getKey(), data)));
        if (oValue.length !== this.length)
            trigger(this.getKey(), oValue, this);
        return r;
    });
    if (dt)
        dt.forEach(function (x) { return prCopy.push(x); });
    created = true;
    return prCopy;
}
//# sourceMappingURL=CustomArray.js.map