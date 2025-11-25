/**
 * Utility types for better type safety and developer experience
 */

/** Make all properties of T readonly recursively */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** Make specific keys optional while keeping others required */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific keys required while keeping others optional */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Extract non-nullable values from a type */
export type NonNullable<T> = T extends null | undefined ? never : T;

/** Create a type with all properties optional except specified keys */
export type RequireOnly<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

/** Create a union of all possible keys of T */
export type Keys<T> = keyof T;

/** Create a union of all possible values of T */
export type Values<T> = T[keyof T];

/** Check if a type extends another type */
export type Extends<T, U> = T extends U ? true : false;

/** Get the type of array elements */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/** Create a type that represents a function with specific parameters and return type */
export type Func<TParams extends readonly unknown[] = readonly unknown[], TReturn = unknown> = 
  (...args: TParams) => TReturn;

/** Create a type for async functions */
export type AsyncFunc<TParams extends readonly unknown[] = readonly unknown[], TReturn = unknown> = 
  (...args: TParams) => Promise<TReturn>;

/** Create a type for event handlers */
export type EventHandler<TEvent = Event> = (event: TEvent) => void;

/** Create a type for React component props */
export type ComponentProps<T = Record<string, unknown>> = T & {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly 'data-testid'?: string;
};

/** Create a type for API endpoints */
export type APIEndpoint<TRequest = unknown, TResponse = unknown> = {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly path: string;
  readonly request?: TRequest;
  readonly response: TResponse;
};

/** Create a type for configuration objects */
export type Config<T> = DeepReadonly<T>;

/** Create a type for mutable versions of readonly types */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends readonly (infer U)[] 
    ? U[] 
    : T[P] extends object 
      ? Mutable<T[P]> 
      : T[P];
};

/** Create a branded type for better type safety */
export type Brand<T, B> = T & { readonly __brand: B };

/** Create a nominal type (similar to branded but more strict) */
export type Nominal<T, N extends string> = T & { readonly [K in N]: never };

/** Type guard helper */
export type TypeGuard<T> = (value: unknown) => value is T;

/** Predicate function type */
export type Predicate<T> = (value: T) => boolean;

/** Comparator function type */
export type Comparator<T> = (a: T, b: T) => number;

/** Transformer function type */
export type Transformer<TInput, TOutput> = (input: TInput) => TOutput;

/** Validator function type */
export type Validator<T> = (value: T) => boolean | string;

/** Error with additional context */
export type ContextualError<TContext = Record<string, unknown>> = Error & {
  readonly context: TContext;
  readonly code?: string;
  readonly retryable?: boolean;
};

/** Result type for operations that can fail */
export type Result<TSuccess, TError = Error> = 
  | { readonly success: true; readonly data: TSuccess }
  | { readonly success: false; readonly error: TError };

/** Option type for values that may not exist */
export type Option<T> = T | null | undefined;

/** Create a type that represents a cache entry */
export type CacheEntry<T> = {
  readonly value: T;
  readonly timestamp: number;
  readonly ttl?: number;
};

/** Create a type for debounced functions */
export type DebouncedFunc<T extends Func> = T & {
  readonly cancel: () => void;
  readonly flush: () => void;
  readonly pending: () => boolean;
};

/** Create a type for throttled functions */
export type ThrottledFunc<T extends Func> = T & {
  readonly cancel: () => void;
  readonly flush: () => void;
};