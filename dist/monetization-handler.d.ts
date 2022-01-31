/**
 * Fetch this class from your WmpClient object, instead of instantiating it yourself!
 *
 * ```ts
 * myWmpClient.getMonetizationHandler()
 * ```
 */
export declare class MonetizationHandler {
    private wm;
    paymentPointer: string | null;
    monetizationId: string | null;
    constructor();
    /**
     * Is Web Monetization supported (document.monetization != undefined)?
     */
    isMonetizationSupported(): boolean;
    /**
     * Checks the document.monetization.state property for a `'pending'` or `'stopped'` state.
     * @returns True if state property is defined and not `'started'`
     * @throws If state is not one of `'pending'`, `'stopped'` or `'started'`
     */
    isReadyForPayment(): boolean;
    /**
     * Start detecting meta tags
     */
    private startDetection;
    /**
     * Search for static meta tag.
     * @returns True if found, false otherwise
     */
    private searchStaticMetaTag;
    /**
     * Start listening for changes on the meta[name=monetization] in the head section
     */
    private listenForMetaTagChanges;
    /**
     * Returns wether the document.monetization.state equals 'started'
     * @returns True if state equals 'started'
     */
    isStarted(): boolean;
    /**
     * Returns wether the document.monetization.state equals 'stopped'
     * @returns True if state equals 'stopped'
     */
    isStopped(): boolean;
    /**
     * Returns wether the document.monetization.state equals 'pending'
     * @returns True if state equals 'pending'
     */
    isPending(): boolean;
    /**
     * Sets the monetization state. And optionally sends a matching event from the monetization event source.
     * @param state New state to set
     * @param event Event details to dispatch on the monetization eventsource.
     */
    private setMonetizationState;
    /**
     * Sends a monetizationprogress event from the monetization event source.
     * @param detail The details to be sent with the event.
     */
    private sendProgressEvent;
    /**
     * Sets a new payment pointer string and generates a unique (uuid v4) monetizationId.
     * @param pointer The new payment pointer string
     */
    private setPaymentPointer;
    /**
     * Resets the paymnet pointer back to null.
     */
    private resetPaymentPointer;
    /**
    * Monetization meta tag found, no payments sent yet
    */
    private wmPending;
    /**
     * Payment stream started, first payment sent.
     * Fires proper events.
     */
    firePaymentStarted(): void;
    /**
     * Payment stream stopped.
     * Fires proper events.
     * @param finalized True when meta tag was removed or payment pointer changed
     */
    firePaymentStopped(finalized: boolean): void;
    /**
     * Payment busy, report progress.
     * Fires proper events.
     * @param evt The event to parse the `data` property from
     */
    firePaymentProgress(evt: MessageEvent): void;
}
