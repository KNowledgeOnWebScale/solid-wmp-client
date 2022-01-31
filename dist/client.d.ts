import { MonetizationHandler } from './monetization-handler';
/**
 * Instantiate with `new WmpClient()`.
 *
 * You can request a utility object with `getMonetizationHandler()` for handling the document.monetization object.
 *
 * Initiate a payment with `setupPayment(...)`
 */
export declare class WmpClient {
    private monetizationHandler;
    private socket;
    constructor();
    /**
     * Returns the current MonetizationHandler of this client. This instance acts as a utility class for the document.monetization object.
     * @returns MonetizationHandler instance
     */
    getMonetizationHandler(): MonetizationHandler;
    /**
     * Instruct Web Monetization Provider to initiate a payment.
     *
     * This will first check if the document.monetization.state property is `'pending'` or `'stopped'`.
     *
     * Next it will request the payment pointer as found in the meta tag and do a POST to the Web Monetization Provider Uri (`wmpUri`)
     * with query path `/api/me/sessions`. On creation of a session, the session URI will be returned in the Location header.
     *
     * We will GET the uri and read the Link header, searching for the `channel` `rel` attribute.
     *
     * That channel URI will then be used to open an WebSocket channel (using SockJS) to start the micropayments and receive events on the progress.
     *
     * Event listeners are set up, to broadcast the proper events on the document.monetization EventSource object.
     *
     * @param wmpUrl The URL of the Web Monetization Provider
     * @param fetchFunction Optional fetch function (that has authentication headers preconfigures for instance)
     */
    setupPayment(wmpUrl: string, fetchFunction?: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>): void;
    /**
     * Close the current monetization stream, if one is open.
     */
    closeMonetizationStream(): void;
}
