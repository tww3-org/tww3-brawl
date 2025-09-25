export type Paths<T, Prev extends string = ""> = {
    [K in keyof T & string]:
      // si c'est un tableau, on descend avec [number].
      T[K] extends readonly (infer U)[]
        ? Paths<U, `${Prev}${K}[${number}].`>
        // si c'est un objet, on continue à descendre avec un point.
        : T[K] extends object
          ? Paths<T[K], `${Prev}${K}.`>
          // sinon, c'est une feuille.
          : `${Prev}${K}`
  }[keyof T & string];

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? PathValue<PropValue<T, K>, Rest>
  : PropValue<T, P>;

type PropValue<T, K extends string> = K extends keyof T ? T[K] : never;

export function getTyped<T, P extends Paths<T>>(obj: T, path: P): PathValue<T, P> {
  return (path as string).split('.').reduce<any>((acc, key) => acc?.[key], obj);
}

export function setTyped<T, P extends Paths<T>>(
  obj: T,
  path: P,
  value: Paths<T, P>
): void {
  const keys = (path as string).split('.');
  let curr: any = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    curr[k] ??= {};
    curr = curr[k];
  }
  curr[keys[keys.length - 1]] = value;
}