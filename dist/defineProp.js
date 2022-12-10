export var defineMethod = function (item, k, g) {
    try {
        Object.defineProperty(item, k, {
            value: g.bind(item),
            enumerable: false,
            configurable: true
        });
    }
    catch (e) {
        console.error(e);
    }
};
export var defineProp = function (item, k, v) {
    try {
        Object.defineProperty(item, k, {
            value: v,
            enumerable: false,
            configurable: false,
            writable: false
        });
    }
    catch (e) {
        console.error(e);
    }
};
//# sourceMappingURL=defineProp.js.map