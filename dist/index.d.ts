declare type MutatedItems = () => any[];
export declare type IGlobalState<T> = {
    subscribe: (func: (item: T, props: ValueChange[]) => void, items?: MutatedItems) => EventSubscriper;
    hook: (items?: MutatedItems) => void;
};
export declare type ValueChange = {
    key: string;
    oldValue: any;
    newValue: any;
};
declare class EventSubscriper {
    func: Function;
    items: string[];
    constructor(func: Function, items?: () => any[]);
}
declare const _default: <T>(item: T) => T & IGlobalState<T>;
export default _default;
