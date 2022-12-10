declare type MutatedItems<T, B> = (x: T) => B[];
export declare type IGlobalState<T> = {
    subscribe: <B>(func: (item: T, props: ValueChange[]) => void, cols?: MutatedItems<T, B>, identifier?: string) => T & IGlobalState<T>;
    hook: <B>(cols?: MutatedItems<T, B>, identifier?: string) => T & IGlobalState<T>;
    stringify: () => string;
    triggerChange: (toOnChange?: boolean, ...identifier: string[]) => void;
};
export declare type ValueChange = {
    key: string;
    oldValue: any;
    newValue: any;
};
declare const _default: <T>(item: T, execludeComponentsFromMutations?: MutatedItems<T, any> | undefined, disableTimer?: boolean | undefined, onChange?: ((item: any, props: ValueChange[]) => void) | undefined) => T & IGlobalState<T>;
export default _default;
