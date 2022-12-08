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
const __events = new Map<GlobalState<any>, [number, EventSubscriper][]>();
const __hooks = new Map<
  GlobalState<any>,
  [number, Function, number, string[]][]
>();
const __execludedKeys = new Map<number, string[]>();
type MutatedItems<T, B> = (x: T) => B[];
const ids = { id: 0 };
export type IGlobalState<T> = {
  subscribe: <B>(
    func: (item: T, props: ValueChange[]) => void,
    items?: MutatedItems<T, B>
  ) => EventSubscriper;
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
    const rAny = React as any;
    const ref = rAny.useRef(0);
    const events = this.getEvents();
    const event = new EventSubscriper(func, items);

    if (ref.current === 0) {
      ref.current = ++ids.id;
      events.push([ref.current, event]);
    } else {
      const e = events.find((x) => x[0] === ref.current);
      if (e) e[1].func = func;
    }

    rAny.useEffect(() => {
      return () => {
        this.unsubscribe(ref.current);
      };
    }, []);

    return this.getEvents()[this.getEvents().length - 1];
  }

  hook<B>(items?: MutatedItems<T, B>) {
    const rAny = React as any;
    const [counter, setCounter] = rAny.useState(0);
    const ref = rAny.useRef(0);
    if (ref.current === 0) {
      ref.current = ++ids.id;
    }
    this.addHook([
      counter,
      setCounter.bind(counter),
      ref.current,
      items ? getColumns(items) : [],
    ]);
    rAny.useEffect(() => {
      return () => {
        this.removeHook(ref.current);
      };
    }, []);
  }

  private unsubscribe(item: number) {
    const events = this.getEvents();
    if (events.find((x) => x[0] === item))
      events.splice(
        events.findIndex((x) => x[0] == item),
        1
      );
  }

  private addHook(value: [number, Function, number, string[]]) {
    if (!__hooks.get(this)) __hooks.set(this, []);
    const item = __hooks.get(this);
    let addValue = true;
    for (const c of item as [])
      if (c[2] == value[2]) {
        c[1] == value[1];
        c[0] == value[0];
        addValue = false;
        break;
      }

    if (addValue && item) item.push(value);
  }

  private removeHook(value: number) {
    const item = __hooks.get(this);
    if (item && item.find((x) => x[2] === value))
      item.splice(
        item.indexOf(
          item.find((x) => x[2] === value) as [
            number,
            Function,
            number,
            string[]
          ]
        ),
        1
      );
  }

  private getEvents() {
    if (!__events.get(this)) __events.set(this, []);
    const item = __events.get(this);
    return item as [number, EventSubscriper][];
  }

  constructor(
    tItem: T,
    id: number,
    trigger?: (key: string, oldValue: any, newValue: any) => void,
    parentKey?: string,
    alreadyCloned?: Map<any, GlobalState<any>>
  ) {
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
        return "";
      };
      let timer = undefined as any;
      let caller = [] as { props: ValueChange[]; item: EventSubscriper }[];
      let hooks = [] as [number, Function, number, string[]][];
      if (!trigger)
        trigger = (key: string, oldValue: any, newValue: any) => {
          let isArray = false;
          let arrKey = '';
          const isArrayParent = () => {
            let t = undefined;
            for (let x of key.split('.')) {
              t = item[x];
              arrKey += x;
              if (t && Array.isArray(t)) {
                isArray = true;
                break;
              }
            }
          };
          isArrayParent();
          clearTimeout(timer);
          const events = this.getEvents();
          const func = new Function(`return [${key}]`);
          const ck = getColumns(func, false)[0];

          for (const e of events) {
            const props = { key, oldValue, newValue };
            if (
              e[1].items.includes(ck) ||
              (isArray && e[1].items.includes(arrKey)) ||
              e[1].items.includes(readableParentKey(key)) ||
              e[1].items.length == 0
            ) {
              if (!caller.find((x) => x.item == e[1]))
                caller.push({ item: e[1], props: [props] });
              else caller.find((x) => x.item == e[1])?.props.push(props);
            }
          }

          for (const e of __hooks.get(this) || []) {
            if (
              (e[3].includes(ck) ||
                (isArray && e[3].includes(arrKey)) ||
                e[3].includes(readableParentKey(key)) ||
                e[3].length == 0) &&
              !hooks.includes(e)
            )
              hooks.push(e);
          }

          timer = setTimeout(() => {
            caller.forEach((x) => x.item.func(this, x.props));
            hooks.forEach((x) => {
              x[0] = x[0] + 1;
              x[1](x[0]);
            });
            caller = [];
            hooks = [];
          }, 100);
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
              r.push(createArray(x, onCreate.bind(this), trigger?.bind(this), key));
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
                  new GlobalState(
                    x,
                    id,
                    trigger?.bind(this),
                    key,
                    alreadyCloned
                  )
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

          Object.defineProperty(this, key, {
            get: () => val,
            set: (value) => {
              let oValue = value;
              if (value == val) return;
              if (!value.isGlobalState) alreadyCloned?.delete(oValue);
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
              val = value;
              if (trigger && value !== oldValue)
                trigger(prKey(key), oldValue, value);
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
  var str = fn.toString().replace(/\"|\'/gim, "");
  let colName = '';
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
    return str.split(',').map((x) => {
      x = x.trim();
      if (x.indexOf(colName) === 0) return x.substring(colName.length);
      return x;
    });
  }
  return str.split(',');
};

class EventSubscriper {
  func: Function;
  items: string[];
  constructor(func: Function, items?: Function) {
    this.func = func;
    if (items) this.items = getColumns(items);
    else this.items = [];
  }
}

export default <T>(
  item: T,
  execludeComponentsFromMutations?: MutatedItems<T, any>
) => {
  const id = ++ids.id;
  __execludedKeys.set(id, execludeComponentsFromMutations ? getColumns(execludeComponentsFromMutations) : []);
  return new GlobalState<T>(
    item,
    id
  ) as any as T & IGlobalState<T>;
};
