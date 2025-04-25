/* eslint-disable @typescript-eslint/no-explicit-any */

export function deferredPromise<T>(): Promise<{
  promise: Promise<T>;
  resolve: (result: T) => void;
  reject: (error: any) => void;
}> {
  return new Promise((onready) => {
    let promise: Promise<T> | null = null;
    let resolve: ((result: T) => void) | null = null;
    let reject: ((error: any) => void) | null = null;
    let didCallReady: boolean = false;
    promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
      if (promise && !didCallReady) {
        didCallReady = true;
        onready({ promise, resolve, reject });
      }
    });
    if (resolve && reject && !didCallReady) {
      didCallReady = true;
      onready({ promise, resolve, reject });
    }
  });
}
