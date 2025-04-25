
export function deferredPromise<T> (): Promise<{ promise: Promise<T>, resolve: (result: T) => void, reject: (error: any) => void }> {
  return new Promise(function (onready) {
    let promise: Promise<T> | null = null, resolve: ((result: T) => void) | null = null, reject: ((error: any) => void) | null = null, did_call_ready: boolean = false;
    promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
      if (promise && !did_call_ready) {
        did_call_ready = true;
        onready({promise,resolve,reject});
      }
    });
    if (resolve && reject && !did_call_ready) {
      did_call_ready = true;
      onready({promise,resolve,reject});
    }
  });
}
