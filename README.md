# Svelte Mutable Stores

A Svelte preprocessor that transforms mutable store assignments into immutable assignments so you can use:

```js
$store.user.name = "John";
```

instead of:

```js
$store = { ...$store, user: { ...$store.user, name: "John" } };
```

in your Svelte components with the `<svelte:options immutable={true} />` option.

## How it works

It transforms store assignments that contain a property in `store.update()` calls that use the `produce` function from `immer`:

```js
// Turns
$store.prop = x;
// Into
store.update(
  produce(($store) => {
    $store.prop = x;
  })
);
```

It also includes the `immer` import at the top of the code:

```js
import { produce } from "immer";
```

## Usage

It is recommended to use with `svelte.config.js` file, located at the project root.

```js
import mutableStores from "svelte-mutable-stores";

const config = {
  preprocess: [
    // Other preprocessors...
    mutableStores(),
  ],
};

export default config;
```
