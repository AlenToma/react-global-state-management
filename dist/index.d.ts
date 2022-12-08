declare type MutatedItems<T, B> = (x: T) => B[];
export declare type IGlobalState<T> = {
    subscribe: <B>(func: (item: T, props: ValueChange[]) => void, items?: MutatedItems<T, B>) => void;
    hook: <B>(items?: MutatedItems<T, B>) => void;
};
export declare type ValueChange = {
    key: string;
    oldValue: any;
    newValue: any;
};
declare const _default: <T>(item: T, execludeComponentsFromMutations?: MutatedItems<T, any> | undefined) => T & IGlobalState<T>;
export default _default;
