class Payment {
    constructor(amount, currency, recipient) {
        this.amount = amount;
        this.currency = currency;
        this.recipient = recipient;
    }

    processPayment() {
        // Add logic to process the payment here
        console.log(`Processing payment of ${this.amount} ${this.currency} to ${this.recipient}`);
    }
}

module.exports = Payment;