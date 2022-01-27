import * as SockJS from 'sockjs-client';
import { MonetizationHandler } from './monetization-handler';

/**
 * Instantiate with `new WmpClient()`.
 * You can request a utility object with `getMonetizationHandler()` for handling the document.monetization object.
 */
export class WmpClient {
    private monetizationHandler: MonetizationHandler;
    private socket: WebSocket;

    constructor() {
        this.monetizationHandler = new MonetizationHandler();
    }

    getMonetizationHandler(): MonetizationHandler {
        return this.monetizationHandler;
    }

    /**
     * Instruct Web Monetization Provider to initiate a payment
     */
    setupPayment(wmpUri: string, fetchFunction?: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) {
        if (this.monetizationHandler.isReadyForPayment()) {
            // Get request Id
            const body = JSON.stringify({ targetPaymentPointer: this.monetizationHandler.paymentPointer })
            const method = 'POST';
            const fetch = fetchFunction || window.fetch;
            fetch(`${wmpUri}/api/me/sessions`, { method, body })
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
                this.socket = new SockJS(`${wmpUri}/api/me/sessions/${id}/channel`);
                this.socket.onopen = evt => this.monetizationHandler.firePaymentStarted();
                this.socket.onmessage = evt => this.monetizationHandler.firePaymentProgress(evt);
                this.socket.onclose = evt => this.monetizationHandler.firePaymentStopped(false);
            }
        }
    }

    /**
     * Close the current monetization stream.
     */
    closeMonetizationStream(): void {
        if (this.socket) {
            this.socket.close();
        }
    }




}