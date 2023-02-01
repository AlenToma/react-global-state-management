type NestedKeyOf<T extends object, D extends any[] = [0, 0, 0, 0, 0, 0, 0, 0]> = D extends [any, ...infer DD] ? {
    [K in keyof T & (string | number)]: T[K] extends object ? `${K}` | `${K}.${NestedKeyOf<T[K], DD>}` : `${K}`;
}[keyof T & (string | number)] : never;
type IIdentifier = {
    addIdentifier: (identifier: string) => void;
};
export type IGlobalState<T extends object> = {
    subscribe: (func: (item: T, props: ValueChange[]) => void, ...cols: NestedKeyOf<T>[]) => IIdentifier;
    hook: (...cols: NestedKeyOf<T>[]) => IIdentifier;
    stringify: () => string;
    triggerChange: (toOnChange?: boolean, ...identifier: string[]) => void;
};
export type ValueChange = {
    key: string;
    oldValue: any;
    newValue: any;
};
declare const _default: <T extends object>(item: T, execludeComponentsFromMutations?: { [K in keyof T & (string | number)]: T[K] extends object ? `${K}` | `${K}.${{ [K_1 in keyof T[K] & (string | number)]: T[K][K_1] extends object ? `${K_1}` | `${K_1}.${{ [K_2 in keyof T[K][K_1] & (string | number)]: T[K][K_1][K_2] extends object ? `${K_2}` | `${K_2}.${{ [K_3 in keyof T[K][K_1][K_2] & (string | number)]: T[K][K_1][K_2][K_3] extends object ? `${K_3}` | `${K_3}.${{ [K_4 in keyof T[K][K_1][K_2][K_3] & (string | number)]: T[K][K_1][K_2][K_3][K_4] extends object ? `${K_4}` | `${K_4}.${{ [K_5 in keyof T[K][K_1][K_2][K_3][K_4] & (string | number)]: T[K][K_1][K_2][K_3][K_4][K_5] extends object ? `${K_5}` | `${K_5}.${{ [K_6 in keyof T[K][K_1][K_2][K_3][K_4][K_5] & (string | number)]: T[K][K_1][K_2][K_3][K_4][K_5][K_6] extends object ? `${K_6}` | `${K_6}.${{ [K_7 in keyof T[K][K_1][K_2][K_3][K_4][K_5][K_6] & (string | number)]: T[K][K_1][K_2][K_3][K_4][K_5][K_6][K_7] extends object ? `${K_7}` : `${K_7}`; }[keyof T[K][K_1][K_2][K_3][K_4][K_5][K_6] & (string | number)]}` : `${K_6}`; }[keyof T[K][K_1][K_2][K_3][K_4][K_5] & (string | number)]}` : `${K_5}`; }[keyof T[K][K_1][K_2][K_3][K_4] & (string | number)]}` : `${K_4}`; }[keyof T[K][K_1][K_2][K_3] & (string | number)]}` : `${K_3}`; }[keyof T[K][K_1][K_2] & (string | number)]}` : `${K_2}`; }[keyof T[K][K_1] & (string | number)]}` : `${K_1}`; }[keyof T[K] & (string | number)]}` : `${K}`; }[keyof T & (string | number)][] | undefined, disableTimer?: boolean, onChange?: ((item: any, props: ValueChange[]) => void) | undefined) => T & IGlobalState<T>;
export default _default;
