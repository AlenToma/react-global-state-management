import * as React from 'react';
const __ignoreKeys = ['hook', 'getEvents', 'subscribe', "unsubscribe", "addHook", "removeHook"];
const __events = new Map<GlobalState<any>, [number, EventSubscriper][]>();
const __hooks = new Map<
  GlobalState<any>,
  [number, Function, number, string[]][]
>();
type MutatedItems = () => any[];
let ids = 0;
export type IGlobalState<T> = {
  subscribe: (
    func: (item: T, props: ValueChange[]) => void,
    items?: MutatedItems
  ) => EventSubscriper;
  hook: (items?: MutatedItems) => void;
};

export type ValueChange = {
  key: string;
  oldValue: any;
  newValue: any;
};

class GlobalState<T> {
  subscribe(func: (item: T, props: ValueChange[]) => void, items?: () => any[]) {
    const rAny = React as any;
    const ref = rAny.useRef(0);
    const events = this.getEvents();
    const event = new EventSubscriper(func, items);

    if (ref.current === 0) {
      ref.current = ++ids;
      events.push([ref.current, event]);
    } else {
      const e = events.find((x) => x[0] === ref.current);
      if (e) e[1].func = func;
    }

    rAny.useEffect(() => {
      () => this.unsubscribe(ref.current);
    }, []);

    return this.getEvents()[this.getEvents().length - 1];
  }

  hook(items?: MutatedItems) {
    const rAny = React as any;
    const [counter, setCounter] = rAny.useState(0);
    const ref = rAny.useRef(0);
    if (ref.current === 0) {
      ref.current = ++ids;
    }
    this.addHook([
      counter,
      setCounter.bind(counter),
      ref.current,
      items ? getColumns(items) : [],
    ]);
    rAny.useEffect(() => {
      () => {
        console.log('Removed', ref.current);
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
    item: any,
    trigger?: (key: string, oldValue: any, newValue: any) => void,
    parentKey?: string
  ) {
    try {
      if (!parentKey) parentKey = '';

      const prKey = (key: string) => {
        if (parentKey != '') return parentKey + '.' + key;
        return key;
      };
      let timer = undefined as any;
      let caller = [] as { props: ValueChange[], item: EventSubscriper }[];
      let hooks = [] as [number, Function, number, string[]][];
      if (!trigger)
        trigger = (key: string, oldValue: any, newValue: any) => {
          clearTimeout(timer);
          const events = this.getEvents();
          const func = new Function(`return [${key}]`)
          const ck = getColumns(func, false)[0];
          for (const e of events) {
            const props = { key, oldValue, newValue }
            if ((e[1].items.includes(ck) || e[1].items.length == 0)) {
              if (!caller.find(x => x.item == e[1]))
                caller.push({ item: e[1], props: [props] });
              else caller.find(x => x.item == e[1])?.props.push(props)

            }
          }

          for (const e of __hooks.get(this) || []) {
            if ((e[3].includes(ck) || e[3].length == 0) && !hooks.includes(e))
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
          }, 4);
        };
      let keys = Object.keys(item).filter((x) => !__ignoreKeys.includes(x));
      const prototype = Object.getPrototypeOf(item);

      if (prototype !== undefined && prototype != null) {
        const ignoreKyes = Object.getOwnPropertyNames(Object.prototype);
        keys = [...keys, ...Object.getOwnPropertyNames(prototype)].filter(
          (x) => !ignoreKyes.includes(x)
        );
      }

      for (let key of keys) {
        let val = item[key];
        if (
          typeof val === 'object' &&
          !Array.isArray(val) &&
          val !== undefined &&
          val !== null &&
          typeof val !== 'string'
        ) {
          val = new GlobalState(val, trigger, prKey(key));
        }

        Object.defineProperty(this, key, {
          get: () => val,
          set: (value) => {
            let oValue = value;
            if (
              typeof value === 'object' &&
              !Array.isArray(value) &&
              value !== undefined &&
              value !== null &&
              typeof value !== 'string'
            ) {
              value = new GlobalState(oValue, trigger, prKey(key));
            }
            const oldValue = item[key];
            item[key] = oValue;
            val = value;
            if (trigger) trigger(prKey(key), oldValue, value);
          },
          enumerable: true,
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

const getColumns = (fn: Function, skipFirst?: boolean) => {
  var str = fn.toString();
  if (str.indexOf('.') !== -1 && skipFirst !== false) {
    str = str.substring(str.indexOf('.') + 1);
  }
  if (str.indexOf('[') !== -1) {
    str = str.substring(str.indexOf('[') + 1);
  }
  str = str
    .replace(/\]|'|"|\+|return|;|\.|\}|\{|\(|\)|function| /gim, '')
    .replace(/\r?\n|\r/g, '');
  return str.split(',');
};

class EventSubscriper {
  func: Function;
  items: string[];
  constructor(func: Function, items?: () => any[]) {
    this.func = func;
    if (items) this.items = getColumns(items);
    else this.items = [];
  }
}

export default <T>(item: T) => new GlobalState<T>(item) as any as T & IGlobalState<T>;
