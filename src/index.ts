import * as React from 'react';
import createArray from './CustomArray';
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
    if (typeof v === 'object' && typeof v != 'string') return JSON.stringify(v);
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
  id: number;
  data: T;
  counter: number;
  cols?: MutatedItems<T, any>;
  json?: string;
  constructor(
    id: number,
    data: T,
    counter: number,
    cols?: MutatedItems<T, any>
  ) {
    this.id = id;
    this.data = data;
    this.counter = counter;
    this.cols = cols;
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

const ___dummes = new Map<number, any>();
const __events = new Map<GlobalState<any>, Identifier<Function>[]>();
const __hooks = new Map<GlobalState<any>, Identifier<Function>[]>();
const __execludedKeys = new Map<number, string[]>();
type MutatedItems<T, B> = (x: T) => B[];
const ids = { id: 0 };
export type IGlobalState<T> = {
  subscribe: <B>(
    func: (item: T, props: ValueChange[]) => void,
    items?: MutatedItems<T, B>
  ) => void;
  hook: <B>(items?: MutatedItems<T, B>) => void;
};

export type ValueChange = {
  key: string;
  oldValue: any;
  newValue: any;
};

class GlobalState<T> {
  isGlobalState = () => {
    return true;
  };
  subscribe<B>(
    func: (item: T, props: ValueChange[]) => void,
    items?: MutatedItems<T, B>
  ) {
    try {
      const rAny = React as any;
      const ref = rAny.useRef(0);
      const events = this.getEvents();
      if (ref.current === 0) {
        ref.current = ++ids.id;
        const event = new Identifier<Function>(
          ref.current,
          func,
          0,
          items as any
        );
        if (!events.find((x) => x.id == event.id))
          events.push(event.init(___dummes.get((this as any).____id)));
      } else {
        const e = events.find((x) => x.id === ref.current);
        if (e) e.data = func;
      }

      rAny.useEffect(() => {
        return () => {
          this.unsubscribe(ref.current);
        };
      }, []);

      return this.getEvents()[this.getEvents().length - 1];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  hook<B>(items?: MutatedItems<T, B>) {
    try {
      const rAny = React as any;
      const [counter, setCounter] = rAny.useState(0);
      const ref = rAny.useRef(0);

      if (ref.current === 0) {
        ref.current = ++ids.id;
      }
      this.addHook(
        new Identifier<Function>(ref.current, setCounter, counter, items as any)
      );
      rAny.useEffect(() => {
        return () => this.removeHook(ref.current);
      }, []);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  private unsubscribe(item: number) {
    const events = this.getEvents();
    if (events.find((x) => x.id === item))
      events.splice(
        events.findIndex((x) => x.id == item),
        1
      );
  }

  private addHook(value: Identifier<Function>) {
    if (!__hooks.get(this)) __hooks.set(this, []);
    const item = __hooks.get(this);
    let addValue = true;
    if (item) {
      for (const c of item)
        if (c.id == value.id) {
          c.data = value.data;
          c.counter = value.counter;
          addValue = false;
          break;
        }
    }

    if (addValue && item)
      item.push(value.init(___dummes.get((this as any).____id)));
  }

  private removeHook(value: number) {
    const item = __hooks.get(this);
    if (item && item.find((x) => x.id === value))
      item.splice(item.indexOf(item.find((x) => x.id === value) as any), 1);
  }

  private getEvents() {
    if (!__events.get(this)) __events.set(this, []);
    const item = __events.get(this);
    return item as Identifier<Function>[];
  }

  constructor(
    tItem: T,
    id: number,
    trigger?: (key: string, oldValue: any, newValue: any) => void,
    parentKey?: string,
    alreadyCloned?: Map<any, GlobalState<any>>
  ) {
    const $thisAny = this as any;
    if ($thisAny.____id === undefined)
      Object.defineProperty(this, '____id', {
        value: id,
        enumerable: false,
        configurable: false,
        writable: false,
      });

    if (id > 0 && !___dummes.has(id)) ___dummes.set(id, { ...tItem });
    if (!alreadyCloned) alreadyCloned = new Map();
    const item = tItem as any;
    let dummes = ___dummes.get(id) as any;
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
      if (!trigger)
        trigger = (key: string, oldValue: any, newValue: any) => {
          try {
            const prop = { key, oldValue: oldValue, newValue: newValue };
            clearTimeout(timer);
            const events = this.getEvents();
            for (const e of events || []) {
              let add = true;
              if (e.cols) {
                const s1 = toKeyValue(e.cols(dummes as any));
                if (s1 === e.json) add = false;
                e.json = s1;
              }
              if (add) {
                if (caller.find((x) => x.e == e))
                  caller.find((x) => x.e == e)?.props.push(prop);
                else caller.push({ props: [prop], e });
              }
            }

            for (const e of __hooks.get(this) || []) {
              let add = true;
              if (e.cols) {
                const s1 = toKeyValue(e.cols(dummes as any));
                if (s1 === e.json) add = false;
                e.json = s1;
              }
              if (add) hooks.push(e);
            }

            timer = setTimeout(() => {
              caller.forEach((x) => x.e.data(dummes, x.props));
              hooks.forEach((x) => {
                x.data(x.counter + 1);
              });
              caller = [];
              hooks = [];
            }, 1);
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
        const execludedKeys = __execludedKeys.get(id);
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

      const setDummes = (key: string, value: any) => {
        let fn = undefined;
         let fnText = '';
        try {
          if (key.indexOf('.') === -1)
            fn = new Function('x', 'value', `x.${key} = value`);
          else {
           
            const keys = key.split('.');
            let k = 'x.';
            keys.forEach((x, i) => {
              if (i < key.length - 1 && keys[i + 1] != undefined) {
                k += x;
                let nextKey = keys[i + 1];
                fnText += `if (${k} === undefined || ${k} === null)
                                  ${k} = {${nextKey}:undefined} \n
                                 
                                    `;
                k += '.';
              } else {
                k += x;
                fnText += `${k}= value`;
              }
            });
            fn = new Function('x', 'value', fnText);
          }

          fn(dummes, value);
        } catch (e) {
          console.error(e);
          console.log(fnText)
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
          setDummes(prKey(key), clone(val, val));
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
  execludeComponentsFromMutations?: MutatedItems<T, any>
) => {
  const id = ++ids.id;
  __execludedKeys.set(
    id,
    execludeComponentsFromMutations
      ? getColumns(execludeComponentsFromMutations)
      : []
  );

  return new GlobalState<T>(item, id) as any as T & IGlobalState<T>;
};
