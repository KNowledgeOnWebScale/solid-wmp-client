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

Construct a WmpClient instance:

```typescript
val wmpClient = new WmpClient();
```

#### setupPayment(wmpUri: string, fetchFunction?: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>): void

Instruct Web Monetization Provider to initiate a payment.

This will first check if the document.monetization.state property is `'pending'` or `'stopped'`.

Next it will request the payment pointer as found in the meta tag and do a POST to the Web Monetization Provider Uri (`wmpUri`)
with query path `/api/me/sessions`. On creation of a session, the sessionId will be returned. 

That ID will then be used to open an WebSocket channel (using SockJS) to start the micropayments and receive events on the progress.

Event listeners are set up, to broadcast the proper events on the document.monetization EventSource object.

| argument   | description    |
|----|----|
| `wmpUrl` |The URL of the Web Monetization Provider|
| `fetchFunction` | Optional fetch function (that has authentication headers preconfigures for instance) |

#### closeMonetizationStream()

Close the current monetization stream, if one is open.

#### getMonetizationHandler(): MonetizationHandler

Returns the current MonetizationHandler of this client. This instance acts as a utility class for the document.monetization object.

### MonetizationHandler

Get a MonetizaionHandler instance from an existing WmpClient instance:

```typescript
val wmpClient = new WmpClient();
val monetizationHandler = wmpClient.getMonetizationHandler();
```

#### **isMonetizationSupported(): boolean**

Is Web Monetization supported (document.monetization != undefined)?

#### **isReadyForPayment(): boolean**

Checks the document.monetization.state property for a `'pending'` or `'stopped'` state.

* Returns true if state property is defined and not `'started'`
* Throws error if state is not one of `'pending'`, `'stopped'` or `'started'`

#### **isStarted(): boolean**

Returns wether the document.monetization.state equals 'started'.

#### **isStopped(): boolean**

Returns wether the document.monetization.state equals 'stopped'.

#### **isPending(): boolean**

Returns wether the document.monetization.state equals 'pending'.

#### **firePaymentStarted(): void** _(internal use)_

Payment stream started, first payment sent.
Fires proper events.

#### **firePaymentStopped(finalized: boolean): void** _(internal use)_

Payment stream stopped.
Fires proper events.

| argument   | description    |
|----|----|
| finalized | True when meta tag was removed or payment pointer changed |

#### **firePaymentProgress(evt: MessageEvent): void** _(internal use)_

Payment busy, report progress.
Fires proper events.

| argument   | description    |
|----|----|
| evt | The event to parse the `data` property from |