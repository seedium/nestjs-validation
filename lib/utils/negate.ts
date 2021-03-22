export const negate = (predicate: Function): (() => boolean) => {
  return function (this: unknown, ...args): boolean {
    return !predicate.apply(this, args);
  };
};
