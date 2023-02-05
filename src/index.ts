import * as React from 'react';
import createArray from './CustomArray';
import toJSON from './toJson';
import { defineProp, defineMethod } from './defineProp';
const __ignoreKeys = [
  'hook',
  'getEvents',
  'subscribe',
  'unsubscribe',
  'addHook',
  'removeHook',
  'triggerChange',
  'getProp',
  'stringify',
];

const readFromKey = function (str: string, item: any): any {
  const keys = str.split(".").filter(x => x.length > 0);
  let currentItem = item;
  keys.forEach(x => {
    if (currentItem !== undefined)
      currentItem = currentItem[x];
  })

  return currentItem;
}

type NestedKeyOf<
  T extends object,
  D extends any[] = [0, 0, 0, 0, 0]
> = D extends [any, ...infer DD]
  ? {
    [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K], DD>}`
    : `${K}`;
  }[keyof T & (string | number)]
  : never;

type IIdentifier = {
  addIdentifier: (identifier: string) => void;
};

class Identifier<T extends object> implements IIdentifier {
  id: string;
  data: T;
  counter: number;
  cols?: NestedKeyOf<T>[];
  identifier?: string;
  constructor(
    id: string,
    data: T,
    counter: number,
    cols?: NestedKeyOf<T>[],
    identifier?: string
  ) {
    this.id = id;
    this.data = data;
    this.counter = counter;
    this.cols = cols && cols.length > 0 ? cols : undefined;
    this.identifier = identifier;
  }

  addIdentifier(identifier: string) {
    this.identifier = identifier;
  }
}
const ids = new Map<string, string>();
const uid = (sId?: any): string => {
  if (!sId) sId = '';
  const id =
    Date.now().toString(36) + Math.random().toString(36).substring(2) + sId;
  if (ids.has(id)) return uid(id);
  ids.set(id, id);
  return id;
};

class Methods {
  events = [] as Identifier<Function>[];
  hooks = [] as Identifier<Function>[];
  execludedKeys = [] as string[];
  disableTimer: boolean;
  onChange?: (item: any, props: ValueChange[]) => void;
  keyType: Map<string, string>;
  funcs: Map<string, Function>;
  constructor(
    disableTimer: boolean,
    onChange?: (item: any, props: ValueChange[]) => void
  ) {
    this.disableTimer = disableTimer;
    this.onChange = onChange;
    this.keyType = new Map();
    this.funcs = new Map();
  }
}

const __Properties = new Map<string, Methods>();

export type IGlobalState<T extends object> = {
  subscribe: (
    func: (item: T, props: ValueChange[]) => void,
    ...cols: NestedKeyOf<T>[]
  ) => IIdentifier;
  hook: (...cols: NestedKeyOf<T>[]) => IIdentifier;
  on: <A extends any>(col: NestedKeyOf<T>, func: (item: A) => boolean) => void;
  stringify: () => string;
  triggerChange: (toOnChange?: boolean, ...identifier: string[]) => void;
};

export type ValueChange = {
  key: string;
  oldValue: any;
  newValue: any;
};

const assign = (item: any, id: any) => {
  defineMethod(item, 'isGlobalState', () => true);
  defineProp(item, '____id', id);
};

/**
 * @type Class
 */
class GlobalState<T extends object> {
  private getProp(): Methods {
    if (!__Properties.has((this as any).____id))
      __Properties.set((this as any).____id, new Methods(false));
    return __Properties.get((this as any).____id) as Methods;
  }

  stringify() {
    return toJSON(this);
  }

  subscribe(
    func: (item: T, props: ValueChange[]) => void,
    ...items: NestedKeyOf<T>[]
  ) {
    try {
      const rAny = React as any;
      const ref = rAny.useRef(0);
      const events = this.getProp().events;
      if (ref.current === 0) {
        ref.current = uid();
        const event = new Identifier<Function>(
          ref.current,
          (item: T, props: ValueChange[]) => {
            try {
              func(item, props);
            } catch (e) {
              console.error(e);
            }
          },
          0,
          items as any
        );
        if (!events.find((x) => x.id == event.id)) events.push(event);
      } else {
        const e = events.find((x) => x.id === ref.current);
        if (e) e.data = func;
      }

      rAny.useEffect(() => {
        return () => {
          this.unsubscribe(ref.current);
          ids.delete(ref.current);
        };
      }, []);

      return events.find((x) => x.id == ref.current) as Identifier<T>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  on<A extends any>(col: NestedKeyOf<T>, func: (item: A) => boolean) {
    const rAny = React as any;
    const [counter, setCounter] = rAny.useState(0);
    this.subscribe(() => {
      const value = readFromKey(col, this);
      if (func(value)) {
        setCounter(counter + 1)
      }
    }, col)
  }

  hook(...items: NestedKeyOf<T>[]) {
    try {
      const rAny = React as any;
      const [counter, setCounter] = rAny.useState(0);
      const ref = rAny.useRef(0);
      if (ref.current === 0) {
        ref.current = uid();
      }
      this.addHook(
        new Identifier<Function>(
          ref.current,
          (v: number) => {
            try {
              setCounter(v);
            } catch (e) {
              console.warn('Component is unmounted');
              this.removeHook(ref.current);
            }
          },
          counter,
          items as any
        )
      );
      rAny.useEffect(() => {
        return () => {
          this.removeHook(ref.current);
          ids.delete(ref.current);
        };
      }, []);

      return this.getProp().hooks.find(
        (x) => x.id == ref.current
      ) as Identifier<T>;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  triggerChange(toOnChange?: boolean, ...identifiers: string[]) {
    const methods = this.getProp();
    const events = methods.events;
    const hooks = methods.hooks;
    const cEvents = [] as { props: ValueChange[]; e: Identifier<Function> }[];
    const chooks = [] as Identifier<Function>[];
    for (const e of events) {
      let add = true;
      if (
        identifiers.length > 0 &&
        (!e.identifier || !identifiers.includes(e.identifier))
      ) {
        add = false;
      }
      if (add) {
        if (!cEvents.find((x) => x.e == e)) cEvents.push({ props: [], e });
      }
    }

    for (const e of hooks) {
      let add = true;
      if (
        identifiers.length > 0 &&
        (!e.identifier || !identifiers.includes(e.identifier))
      ) {
        add = false;
      }
      if (add) chooks.push(e);
    }

    if (toOnChange) methods.onChange?.(this, []);
    cEvents.forEach((x) => x.e.data(this, x.props));
    chooks.forEach((x) => {
      x.data(x.counter + 1);
    });
  }

  private unsubscribe(item: string) {
    const events = this.getProp().events;
    if (events.find((x) => x.id === item))
      events.splice(
        events.findIndex((x) => x.id == item),
        1
      );
  }

  private addHook(value: Identifier<Function>) {
    const items = this.getProp().hooks;
    let addValue = true;
    for (const c of items)
      if (c.id == value.id) {
        c.data = value.data;
        c.counter = value.counter;
        addValue = false;
        break;
      }

    if (addValue) items.push(value);
  }

  private removeHook(value: string) {
    const item = this.getProp().hooks;
    if (item && item.find((x) => x.id === value))
      item.splice(item.indexOf(item.find((x) => x.id === value) as any), 1);
  }

  constructor(
    tItem: T,
    id: string,
    trigger?: (key: string, oldValue: any, newValue: any) => void,
    parentKey?: string,
    alreadyCloned?: Map<any, GlobalState<any>>
  ) {
    const $thisAny = this as any;
    if ($thisAny.____id === undefined) assign(this, id);
    if (!alreadyCloned) alreadyCloned = new Map();
    const item = tItem as any;
    try {
      if (!parentKey) parentKey = '';

      const prKey = (key: string) => {
        if (parentKey != '') return parentKey + '.' + key;
        return key;
      };

      const readablePrKey = (key: string) => prKey(key).replace(/\./g, '');

      const readableParentKey = (key: string) => {
        if (key.indexOf('.') != -1)
          return key
            .split('.')
            .reverse()
            .filter((_, i) => i > 0)
            .reverse()
            .join();
        return '';
      };

      let timer = undefined as any;

      let caller = [] as { props: ValueChange[]; e: Identifier<Function> }[];
      let hooks = [] as Identifier<Function>[];
      let propsChanged = [] as ValueChange[];
      if (!trigger)
        trigger = (key: string, oldValue: any, newValue: any) => {
          try {
            const methods = this.getProp();
            const prop = { key, oldValue: oldValue, newValue: newValue };
            propsChanged.push(prop);
            if (!methods.disableTimer) clearTimeout(timer);
            const events = methods.events;
            const keyIncluded = (cols: string[]) => {
              for (let c of cols) {
                if (c === key) return true;
                if (c.indexOf('.') != -1 && c.indexOf(key) != -1) return true;
                if (key.indexOf(".") != -1 && key.indexOf(c) != -1) return true;
              }
              return false;
            };
            for (const e of events) {
              let add = true;
              if (e.cols && !keyIncluded(e.cols)) {
                add = false;
              }
              if (add) {
                if (caller.find((x) => x.e == e))
                  caller.find((x) => x.e == e)?.props.push(prop);
                else caller.push({ props: [prop], e });
              }
            }

            for (const e of methods.hooks) {
              let add = true;
              if (e.cols && !keyIncluded(e.cols)) {
                add = false;
              }
              if (add) hooks.push(e);
            }

            const fn = () => {
              methods.onChange?.(this, propsChanged);
              caller.forEach((x) => x.e.data(this, x.props));
              hooks.forEach((x) => {
                x.data(x.counter + 1);
              });
              caller = [];
              hooks = [];
              propsChanged.splice(0, propsChanged.length);
            };
            if (!methods.disableTimer)
              timer = setTimeout(() => {
                fn();
              }, 0);
            else fn();
          } catch (e) {
            console.error(e);
          }
        };
      let keys = Object.keys(item).filter((x) => !__ignoreKeys.includes(x));
      const prototype = Object.getPrototypeOf(item);

      if (prototype !== undefined && prototype != null) {
        const ignoreKyes = Object.getOwnPropertyNames(Object.prototype);
        keys = [...keys, ...Object.getOwnPropertyNames(prototype)].filter(
          (x) => !ignoreKyes.includes(x)
        );
      }
      const onCreate = (key: string, data: any) => {
        if (!alreadyCloned) alreadyCloned = new Map();
        const r = [] as any[];
        if (typeof data === 'string') data = [data];
        for (let x of data) {
          if (x) {
            if (Array.isArray(x) && typeof x !== 'string') {
              r.push(createArray(x, onCreate, trigger, key));
            } else {
              if (
                typeof x === 'object' &&
                !Array.isArray(x) &&
                typeof x !== 'string' &&
                !isExecluded(key)
              ) {
                alreadyCloned.set(x, x);
                alreadyCloned.set(
                  x,
                  new GlobalState(x, id, trigger, key, alreadyCloned)
                );
                r.push(alreadyCloned.get(x));
              } else r.push(x);
            }
          } else r.push(x);
        }
        return r;
      };

      const isExecluded = (key: string) => {
        const execludedKeys = this.getProp().execludedKeys;
        let r = false;

        if (execludedKeys === undefined) r = false;
        else {
          if (
            execludedKeys.includes(readablePrKey(key)) ||
            execludedKeys.includes(readableParentKey(key))
          )
            r = true;
        }
        return r;
      };

      const setType = (key: string, val: any) => {
        if (
          val === undefined ||
          val === null ||
          this.getProp().keyType.has(key)
        )
          return;
        let valueType = typeof val as string;
        if (Array.isArray(val) && valueType == 'object') {
          valueType = 'array';
        }
        this.getProp().keyType.set(key, valueType);
      };

      for (let key of keys) {
        try {
          let val = item[key];
          if (
            typeof val === 'object' &&
            !Array.isArray(val) &&
            val !== undefined &&
            val !== null &&
            typeof val !== 'string'
          ) {
            if (!isExecluded(key)) {
              if (!alreadyCloned.has(val)) {
                alreadyCloned.set(val, val);
                alreadyCloned.set(
                  val,
                  new GlobalState(
                    val,
                    id,
                    trigger.bind(this),
                    prKey(key),
                    alreadyCloned
                  )
                );
                val = alreadyCloned.get(val);
              } else val = alreadyCloned.get(val);
            }
          } else if (val && Array.isArray(val) && typeof val !== 'string') {
            val = createArray(
              val,
              onCreate.bind(this),
              trigger?.bind(this),
              prKey(key)
            );
          }

          setType(prKey(key), val);
          Object.defineProperty(this, key, {
            get: () => val,
            set: (value) => {
              try {
                let oValue = value;
                if (value == val) return;
                if (value && !value.isGlobalState)
                  alreadyCloned?.delete(oValue);
                if (
                  typeof value === 'object' &&
                  !Array.isArray(value) &&
                  value !== undefined &&
                  value !== null &&
                  typeof value !== 'string'
                ) {
                  if (!isExecluded(key) && !value.isGlobalState) {
                    alreadyCloned?.set(value, value);
                    alreadyCloned?.set(
                      value,
                      new GlobalState(
                        oValue,
                        id,
                        trigger?.bind(this),
                        prKey(key),
                        alreadyCloned
                      )
                    );
                    value = alreadyCloned?.get(value);
                  }
                } else if (
                  value &&
                  Array.isArray(value) &&
                  typeof value !== 'string'
                ) {
                  value = createArray(
                    oValue,
                    onCreate.bind(this),
                    trigger?.bind(this),
                    prKey(key)
                  );
                }

                const oldValue = item[key];
                item[key] = oValue;
                setType(prKey(key), oValue);
                val = value;
                if (trigger && value !== oldValue) {
                  trigger(prKey(key), oldValue, value);
                }
              } catch (e) {
                console.error(e);
                throw e;
              }
            },
            enumerable: true,
          });
        } catch (e) {
          console.error(prKey(key), e);
          console.info(prKey(key), 'wont be included in GlobalState');
        }
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

const getColumns = (fn: Function, skipFirst?: boolean) => {
  var str = fn.toString().replace(/\"|\'/gim, '');
  let colName = '';

  if (str.indexOf('(') !== -1 && str.indexOf(')') && skipFirst !== false) {
    colName = str.substring(str.indexOf('(') + 1, str.indexOf(')')).trim();
  }

  if (str.indexOf(')') !== -1) str = str.substring(str.indexOf(')'));

  str = str
    .replace(/\]|'|"|\+|return|;|\=|\>|\.|\}|\{|\(|\)|\[|function| /gim, '')
    .replace(/\r?\n|\r/g, '');

  if (colName != '') {
    return str.split(',').map((x) => {
      x = x.trim();
      if (x.indexOf(colName) === 0) return x.substring(colName.length);
      return x;
    });
  }
  return str.split(',');
};

export default <T extends object>(
  item: T,
  execludeComponentsFromMutations?: NestedKeyOf<T>[],
  disableTimer?: boolean,
  onChange?: (item: any, props: ValueChange[]) => void
) => {
  const id = uid();
  const methods = new Methods(disableTimer ?? false, onChange);
  __Properties.set(id, methods);
  methods.execludedKeys = execludeComponentsFromMutations
    ? getColumns(('function ' + execludeComponentsFromMutations) as any)
    : [];
  return new GlobalState<T>(item, id) as any as T & IGlobalState<T>;
};
