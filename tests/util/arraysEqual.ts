export const arraysEqual = (a: any[], b: any[]) =>
  a.length === b.length && a.every((val, i) => val === b[i]);
