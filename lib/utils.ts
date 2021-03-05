export function flatten<T>(data: T[][]): T[] {
  return data.reduce((result, currentValue) => {
    if (currentValue.length > 0) {
      result.push(...currentValue);
    }

    return result;
  }, []);
}
