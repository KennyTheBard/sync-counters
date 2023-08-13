export type WithTimestamp<T> = {
    [P in keyof T]: T[P];
} & {
    ts: number;
};
