import React, { useEffect } from 'react';

const PayPalButton = () => {
  useEffect(() => {
    // Check if window.paypal is available (means the SDK script has loaded)
    if (window.paypal) {
      window.paypal.Buttons({
        // Set up the transaction
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '10.00', // This is the amount the user will pay. You can change this.
                               // For testing, keep it a reasonable amount.
                currency_code: 'USD' // Change if your client prefers another currency
              }
            }]
          });
        },
        // Finalize the transaction
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            // This alert is for demonstration. In a real app, you'd send
            // this payment confirmation to your backend.
            alert('Transaction completed by ' + details.payer.name.given_name + '!');
            console.log('Payment details:', details);
            // Here, you would typically make an API call to your backend
            // to record the successful payment and potentially unlock content
            // or update user's subscription status.
            // Example: fetch('/api/record-payment', { method: 'POST', body: JSON.stringify(details) });
          });
        },
        // Handle errors or cancellations
        onCancel: function (data) {
          console.log('Payment cancelled', data);
          alert('Payment was cancelled.');
        },
        onError: function (err) {
          console.error('PayPal button error', err);
          alert('An error occurred during payment. Please try again.');
        }
      }).render('#paypal-button-container'); // Render the button into the div with this ID
    }
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    // This div is where the PayPal button will be rendered by the SDK
    <div id="paypal-button-container" style={{ minWidth: '150px', marginLeft: '10px' }}></div>
  );
};

export default PayPalButton; 