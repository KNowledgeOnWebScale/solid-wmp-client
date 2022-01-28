import * as SockJS from 'sockjs-client';
import { MonetizationHandler } from './monetization-handler';

/**
 * Instantiate with `new WmpClient()`.
 * 
 * You can request a utility object with `getMonetizationHandler()` for handling the document.monetization object.
 * 
 * Initiate a payment with `setupPayment(...)`
 */
export class WmpClient {
    private monetizationHandler: MonetizationHandler;
    private socket: WebSocket;

    constructor() {
        this.monetizationHandler = new MonetizationHandler();
    }

    /**
     * Returns the current MonetizationHandler of this client. This instance acts as a utility class for the document.monetization object.
     * @returns MonetizationHandler instance
     */
    getMonetizationHandler(): MonetizationHandler {
        return this.monetizationHandler;
    }

    /**
     * Instruct Web Monetization Provider to initiate a payment.
     * 
     * This will first check if the document.monetization.state property is `'pending'` or `'stopped'`.
     * 
     * Next it will request the payment pointer as found in the meta tag and do a POST to the Web Monetization Provider Uri (`wmpUri`)
     * with query path `/api/me/sessions`. On creation of a session, the sessionId will be returned. 
     * 
     * That ID will then be used to open an WebSocket channel (using SockJS) to start the micropayments and receive events on the progress.
     * 
     * Event listeners are set up, to broadcast the proper events on the document.monetization EventSource object.
     * 
     * @param wmpUrl The URL of the Web Monetization Provider
     * @param fetchFunction Optional fetch function (that has authentication headers preconfigures for instance)
     */
    setupPayment(wmpUrl: string, fetchFunction?: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>): void {
        if (this.monetizationHandler.isReadyForPayment()) {
            // Get request Id
            const body = JSON.stringify({ targetPaymentPointer: this.monetizationHandler.paymentPointer })
            const method = 'POST';
            const fetch = fetchFunction || window.fetch;
            fetch(`${wmpUrl}/api/me/sessions`, { method, body })
                .then(res => res.json())
                .then(
                    res => setupWebSocket(res.sessionId),
                    err => console.error(err)
                )

            const setupWebSocket = (id: string) => {
                if (this.socket) {
                    this.socket.close();
                    this.socket = null;
                }
                this.socket = new SockJS(`${wmpUrl}/api/me/sessions/${id}/channel`);
                this.socket.onopen = evt => this.monetizationHandler.firePaymentStarted();
                this.socket.onmessage = evt => this.monetizationHandler.firePaymentProgress(evt);
                this.socket.onclose = evt => this.monetizationHandler.firePaymentStopped(false);
            }
        }
    }

    /**
     * Close the current monetization stream, if one is open.
     */
    closeMonetizationStream(): void {
        if (this.socket) {
            this.socket.close();
        }
    }




}