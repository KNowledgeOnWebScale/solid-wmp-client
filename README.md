# Solid WMP Client

This is a client side typescrit/javascript library for interfacing with a component that follows the [Web Monetization Provider draft specification](https://knowledgeonwebscale.github.io/solid-web-monetization/specs.html).

## Usage

Install with npm:
```bash
npm install solid-wmp-client
```

Install with yarn:
```bash
yarn add solid-wmp-client
```

Instantiate the WmpClient class:
```typescript
import { WmpClient } from 'solid-wmp-client';

val wmpClient = new WmpClient();
```

Get a utility class to interface with the document.monetization object:
```typescript
import { WmpClient } from 'solid-wmp-client';

val wmpClient = new WmpClient();
val monetizationHelper = wmpClient.getMonetizationHandler();
```

## API

### WmpClient

TODO: will add later

### MonetizationHandler

TODO: will add later
