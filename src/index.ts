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
];

const toKeyValue = (v?: any) => {
  if (v == undefined || v == null) return undefined;
  try {
    if (typeof v === 'object' && typeof v != 'string') return toJSON(v);
    else return v.toString();
  } catch (e) {
    console.error(e);
    return v.toString();
  }
};

const clone = (item: any, old: any) => {
  if (item === undefined || item == null) {
    if (old && Array.isArray(old)) return [];
    return {};
  }
  if (typeof item === 'object' && !Array.isArray(item)) return { ...item };

  return item;
};

class Identifier<T> {
  id: string;
  data: T;
  counter: number;
  cols?: MutatedItems<T, any>;
  json?: string;
  identifier?: string;
  constructor(
    id: string,
    data: T,
    counter: number,
    cols?: MutatedItems<T, any>,
    identifier?: string
  ) {
    this.id = id;
    this.data = data;
    this.counter = counter;
    this.cols = cols;
    this.identifier = identifier;
  }

  init(parent: any) {
    try {
      if (this.cols) this.json = toKeyValue(this.cols(parent));
    } catch (e) {
      console.error(e);
    }
    return this;
  }
}
const ids = new Map<string, string>();
const uid = (sId?: any): string => {
  if (!sId)
    sId = "";
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2) + sId;
  if (ids.has(id))
    return uid(id);
  ids.set(id, id);
  return id;
}

class Methods {
  dummes = undefined as any;
  events = [] as Identifier<Function>[];
  hooks = [] as Identifier<Function>[];
  execludedKeys = [] as string[];
  disableTimer: boolean;
  onChange?: (item: any, props: ValueChange[]) => void;
  keyType: Map<string, string>;
  constructor(
    disableTimer: boolean,
    onChange?: (item: any, props: ValueChange[]) => void
  ) {
    this.disableTimer = disableTimer;
    this.onChange = onChange;
    this.keyType = new Map();
  }
}

const __Properties = new Map<string, Methods>();
type MutatedItems<T, B> = (x: T) => B[];

export type IGlobalState<T> = {
  subscribe: <B>(
    func: (item: T, props: ValueChange[]) => void,
    cols?: MutatedItems<T, B>,
    identifier?: string
  ) => T & IGlobalState<T>;
  hook: <B>(
    cols?: MutatedItems<T, B>,
    identifier?: string
  ) => T & IGlobalState<T>;
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
class GlobalState<T> {
  private getProp(): Methods {
    if (!__Properties.has((this as any).____id))
      __Properties.set((this as any).____id, new Methods(false));
    return __Properties.get((this as any).____id) as Methods;
  }

  stringify() {
    return toJSON(this);
  }

  subscribe<B>(
    func: (item: T, props: ValueChange[]) => void,
    items?: MutatedItems<T, B>,
    identifier?: string
  ) {
    try {
      const rAny = React as any;
      const ref = rAny.useRef(0);
      const events = this.getProp().events;
      if (ref.current === 0) {
        ref.current = uid();
        const event = new Identifier<Function>(
          ref.current,
          func,
          0,
          items as any,
          identifier
        );
        if (!events.find((x) => x.id == event.id))
          events.push(event.init(this.getProp().dummes));
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

      return this;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  hook<B>(items?: MutatedItems<T, B>, identifier?: string) {
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
          setCounter,
          counter,
          items as any,
          identifier
        )
      );
      rAny.useEffect(() => {
        return () => {
          this.removeHook(ref.current);
          ids.delete(ref.current);
        }
      }, []);

      return this;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  triggerChange(toOnChange?: boolean, ...identifiers: string[]) {
    const methods = this.getProp();
    let dummes = methods.dummes;
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
    cEvents.forEach((x) => x.e.data(dummes, x.props));
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

    if (addValue) items.push(value.init(this.getProp().dummes));
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
    if (this.getProp().dummes == undefined)
      this.getProp().dummes = JSON.parse(toJSON(tItem));
    if (!alreadyCloned) alreadyCloned = new Map();
    const item = tItem as any;
    let dummes = this.getProp().dummes;
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
            for (const e of events) {
              let add = true;
              if (e.cols) {
                const s1 = toKeyValue(e.cols(dummes));
                if (s1 === e.json) add = false;
                e.json = s1;
              }
              if (add) {
                if (caller.find((x) => x.e == e))
                  caller.find((x) => x.e == e)?.props.push(prop);
                else caller.push({ props: [prop], e });
              }
            }

            for (const e of methods.hooks) {
              let add = true;
              if (e.cols) {
                const s1 = toKeyValue(e.cols(dummes));
                if (s1 === e.json) add = false;
                e.json = s1;
              }
              if (add) hooks.push(e);
            }

            const fn = () => {
              methods.onChange?.(this, propsChanged);
              caller.forEach((x) => x.e.data(dummes, x.props));
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
        if (val === undefined || val === null || this.getProp().keyType.has(key))
          return;
        let valueType = typeof val as string;
        if (Array.isArray(val) && valueType == "object") {
          valueType = "array";
        }
        this.getProp().keyType.set(key, valueType);
      }

      const setDummes = (key: string, value: any) => {
        let fn = undefined;
        let fnText = '';
        if (value && typeof value === 'object')
          value = JSON.parse(toJSON(value));
        try {
          if (key.indexOf('.') === -1)
            fn = new Function('x', "i", 'value', `x.${key} = value`);
          else {
            const keys = key.split('.');
            let k = 'x.';
            keys.forEach((x, i) => {
              if (i < key.length - 1 && keys[i + 1] != undefined) {
                k += x;
                let nextKey = keys[i + 1];
                fnText += `
                        if (${k} === undefined || ${k} === null){
                                  if((!i.has("${k}".substring(1)) || i.get("${k}".substring(1)) == "object"))
                                      ${k} = {${nextKey}:undefined}
                                  else if (i.get("${k}".substring(1)) == "array") ${k} = [];
                                  else ${k} = undefined;
                                 }
                                `;
                k += '.';
              } else {
                k += x;
                fnText += `${k}= value`;
              }
            });
            fn = new Function('x', "i", 'value', fnText);
          }

          fn(dummes, this.getProp().keyType, value);
        } catch (e) {
          console.error(e);
          console.info(fnText);
        }
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

          setType(prKey(key), val)
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
                setDummes(prKey(key), clone(oValue, oldValue));
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

export default <T>(
  item: T,
  execludeComponentsFromMutations?: MutatedItems<T, any>,
  disableTimer?: boolean,
  onChange?: (item: any, props: ValueChange[]) => void
) => {
  const id = uid();
  const methods = new Methods(disableTimer ?? false, onChange);
  __Properties.set(id, methods);
  methods.execludedKeys = execludeComponentsFromMutations ? getColumns(execludeComponentsFromMutations) : [];
  return new GlobalState<T>(item, id) as any as T & IGlobalState<T>;
};
