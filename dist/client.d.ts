import { MonetizationHandler } from './monetization-handler';
/**
 * Instantiate with `new WmpClient()`.
 * You can request a utility object with `getMonetizationHandler()` for handling the document.monetization object.
 */
export declare class WmpClient {
    private monetizationHandler;
    private socket;
    constructor();
    getMonetizationHandler(): MonetizationHandler;
    /**
     * Instruct Web Monetization Provider to initiate a payment
     */
    setupPayment(wmpUri: string, fetchFunction?: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>): void;
    /**
     * Close the current monetization stream.
     */
    closeMonetizationStream(): void;
}
