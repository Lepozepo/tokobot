# How to use?

```
// Define the worker
const worker = new Tokobot(e => {
  window.importScripts('...');
  const props = e.data;
});

// Use the worker
await worker.run({ ...values });
```

