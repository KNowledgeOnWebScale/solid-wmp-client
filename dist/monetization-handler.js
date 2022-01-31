import { v4 as uuidv4 } from "uuid";
/**
 * Fetch this class from your WmpClient object, instead of instantiating it yourself!
 *
 * ```ts
 * myWmpClient.getMonetizationHandler()
 * ```
 */
export class MonetizationHandler {
    constructor() {
        this.paymentPointer = null;
        this.monetizationId = null;
        // Test WM capability
        this.wm = document.monetization;
        if (!this.isMonetizationSupported()) {
            throw new Error('No web monetization support in browser!');
        }
        // Detect tags
        this.startDetection();
    }
    /**
     * Is Web Monetization supported (document.monetization != undefined)?
     */
    isMonetizationSupported() {
        return this.wm != undefined && this.wm != null;
    }
    /**
     * Checks the document.monetization.state property for a `'pending'` or `'stopped'` state.
     * @returns True if state property is defined and not `'started'`
     * @throws If state is not one of `'pending'`, `'stopped'` or `'started'`
     */
    isReadyForPayment() {
        if (this.wm.state != 'pending' && this.wm.state != 'stopped' && this.wm.state != 'started') {
            throw new Error('No meta[name="monetization"] tag found!');
        }
        else {
            return this.wm.state != 'started';
        }
    }
    /**
     * Start detecting meta tags
     */
    startDetection() {
        const found = this.searchStaticMetaTag();
        // Not found, means WM is detected, but no tag found yet
        if (!found) {
            this.setMonetizationState('stopped');
        }
        // Keep searching for meta tag changes
        this.listenForMetaTagChanges();
    }
    /**
     * Search for static meta tag.
     * @returns True if found, false otherwise
     */
    searchStaticMetaTag() {
        let metas = document.getElementsByTagName('meta');
        let meta = metas.namedItem('monetization');
        if (meta && meta.content) {
            this.setPaymentPointer(meta.content);
            return true;
        }
        return false;
    }
    /**
     * Start listening for changes on the meta[name=monetization] in the head section
     */
    listenForMetaTagChanges() {
        const observerHead = new MutationObserver(list => {
            list.forEach(record => {
                if (record.addedNodes.length > 0) {
                    record.addedNodes.forEach(node => {
                        const el = node;
                        if (el.getAttribute('name') == 'monetization' && el.getAttribute('content') != this.paymentPointer) {
                            this.setPaymentPointer(el.getAttribute('content'));
                            // add observer on meta tag for attribute changes
                            observerMeta.observe(el, { attributes: true, childList: false, subtree: false });
                        }
                    });
                }
                if (record.removedNodes.length > 0) {
                    record.removedNodes.forEach(node => {
                        const el = node;
                        if (el.getAttribute('name') == 'monetization' && el.getAttribute('content') == this.paymentPointer) {
                            this.resetPaymentPointer();
                            // disconnect existing observer for meta tag
                            observerMeta.disconnect();
                        }
                    });
                }
            });
        });
        const observerMeta = new MutationObserver(list => {
            list.forEach(record => {
                if (record.type == 'attributes' && record.attributeName == 'content') {
                    const el = record.target;
                    this.setPaymentPointer(el.getAttribute('content'));
                }
            });
        });
        observerHead.observe(document.head, { attributes: false, childList: true, subtree: false });
        // If meta tag present: add observer for meta tag
        const targetNode = document.querySelector("meta[name='monetization']");
        if (targetNode) {
            observerMeta.observe(targetNode, { attributes: true, childList: false, subtree: false });
        }
    }
    /**
     * Returns wether the document.monetization.state equals 'started'
     * @returns True if state equals 'started'
     */
    isStarted() {
        return this.wm.state == 'started';
    }
    /**
     * Returns wether the document.monetization.state equals 'stopped'
     * @returns True if state equals 'stopped'
     */
    isStopped() {
        return this.wm.state == 'stopped';
    }
    /**
     * Returns wether the document.monetization.state equals 'pending'
     * @returns True if state equals 'pending'
     */
    isPending() {
        return this.wm.state == 'pending';
    }
    /**
     * Sets the monetization state. And optionally sends a matching event from the monetization event source.
     * @param state New state to set
     * @param event Event details to dispatch on the monetization eventsource.
     */
    setMonetizationState(state, detail) {
        this.wm.state = state;
        let event;
        switch (state) {
            case 'started':
                event = new CustomEvent('monetizationstart', { detail });
                break;
            case 'stopped':
                event = new CustomEvent('monetizationstop', { detail });
                break;
            case 'pending':
                event = new CustomEvent('monetizationpending', { detail });
                break;
        }
        this.wm.dispatchEvent(event);
    }
    /**
     * Sends a monetizationprogress event from the monetization event source.
     * @param detail The details to be sent with the event.
     */
    sendProgressEvent(detail) {
        this.wm.dispatchEvent(new CustomEvent('monetizationprogress', { detail }));
    }
    /**
     * Sets a new payment pointer string and generates a unique (uuid v4) monetizationId.
     * @param pointer The new payment pointer string
     */
    setPaymentPointer(pointer) {
        if (pointer != this.paymentPointer) {
            if (this.isStarted()) {
                this.firePaymentStopped(true);
            }
            this.paymentPointer = pointer;
            this.monetizationId = uuidv4();
            this.wmPending();
        }
    }
    /**
     * Resets the paymnet pointer back to null.
     */
    resetPaymentPointer() {
        if (this.paymentPointer != null) {
            this.firePaymentStopped(true);
            this.paymentPointer = null;
            this.monetizationId = null;
        }
    }
    /**
    * Monetization meta tag found, no payments sent yet
    */
    wmPending() {
        const detail = {
            paymentPointer: this.paymentPointer,
            requestId: this.monetizationId
        };
        this.setMonetizationState('pending', detail);
    }
    /**
     * Payment stream started, first payment sent.
     * Fires proper events.
     */
    firePaymentStarted() {
        const detail = {
            paymentPointer: this.paymentPointer,
            requestId: this.monetizationId,
        };
        this.setMonetizationState('started', detail);
    }
    /**
     * Payment stream stopped.
     * Fires proper events.
     * @param finalized True when meta tag was removed or payment pointer changed
     */
    firePaymentStopped(finalized) {
        const detail = {
            paymentPointer: this.paymentPointer,
            requestId: this.monetizationId,
            finalized
        };
        this.setMonetizationState('stopped', detail);
    }
    /**
     * Payment busy, report progress.
     * Fires proper events.
     * @param evt The event to parse the `data` property from
     */
    firePaymentProgress(evt) {
        const data = JSON.parse(evt.data);
        const detail = {
            paymentPointer: this.paymentPointer,
            requestId: this.monetizationId,
            amount: data.amount,
            assetCode: data.assetCode,
            assetScale: data.assetScale
        };
        this.sendProgressEvent(detail);
    }
}
