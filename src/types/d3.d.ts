/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'd3' {
  export type NumberValue = number | { valueOf(): number };
  export type PieArcDatum<T> = any;

  export const schemeTableau10: readonly string[];

  export function select<GElement = any, Datum = any>(
    selector: any
  ): any;

  export function selectAll<GElement = any, Datum = any>(
    selector: any
  ): any;

  export function min<T>(array: Iterable<T>, accessor?: (datum: T, index: number, array: Iterable<T>) => any): any;
  export function max<T>(array: Iterable<T>, accessor?: (datum: T, index: number, array: Iterable<T>) => any): any;

  export function scaleTime<Range = number, Output = number>(): any;
  export function scaleLinear<Range = number, Output = number>(): any;
  export function scaleBand<Domain = string>(): any;

  export function area<Datum = any>(): any;
  export function line<Datum = any>(): any;
  export function pie<Datum = any>(): any;
  export function arc<Datum = any>(): any;

  export const curveMonotoneX: any;

  export function axisBottom<Domain = any>(scale: any): any;
  export function axisLeft<Domain = any>(scale: any): any;

  export function timeFormat(specifier: string): (date: Date) => string;
  export function format(specifier: string): (n: number | { valueOf(): number }) => string;

  export function pointer(event: any, target?: any): [number, number];
  export function bisector<T, U>(accessor: (d: T) => U): any;
}
