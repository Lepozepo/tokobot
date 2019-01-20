export default class Tokobot {
  constructor(fn) {
    this.props = { fn };
  }

  static promises = [];

  async worker() {
    try {
      const clusterSize = navigator.hardwareConcurrency
        ? Math.min(navigator.hardwareConcurrency, 4)
        : 4;
      const incompletePromises = Tokobot.promises.filter(p => !p.complete);
      if (incompletePromises.length === clusterSize) {
        await incompletePromises[0];
      }

      return this.createWorker();
    } catch (err) {
      throw err;
    }
  }

  createWorker = () => {
    const blob = new Blob([
      `var window=this;var global=this;onmessage = ${this.props.fn.toString()}`,
    ]);
    const blobUrl = window.URL.createObjectURL(blob);

    return new Worker(blobUrl);
  };

  run = (...args) => {
    const promise = new Promise(async (resolve, reject) => {
      const worker = await this.worker();
      worker.onmessage = result => {
        worker.terminate();
        resolve(result);
      };
      worker.onerror = error => {
        worker.terminate();
        reject(error);
      };
      worker.postMessage.apply(worker, args);
    });

    Tokobot.promises = [
      ...Tokobot.promises.filter(p => !p.complete), // Remove resolved promises from memory
      promise
        .then(() => (promise.complete = true))
        .catch(() => (promise.complete = true)),
    ];
    return promise;
  };
}
