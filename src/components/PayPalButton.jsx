import React, { useEffect, useRef } from 'react';

// Accept 'amount' and 'planId' as props
const PayPalButton = ({ amount, planId }) => {
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    // Ensure the button container exists and PayPal SDK is loaded
    if (buttonContainerRef.current && window.paypal) {
      // Clear any existing buttons to prevent re-rendering issues
      // This is crucial if the component re-renders with new props
      buttonContainerRef.current.innerHTML = '';

      window.paypal.Buttons({
        // Set up the transaction with the dynamic amount
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount, // Use the amount passed as a prop
                currency_code: 'USD' // Ensure this matches your PayPal account's currency
              },
              custom_id: planId // Pass the plan ID for your records
            }]
          });
        },
        // Finalize the transaction
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert('Transaction completed by ' + details.payer.name.given_name + '!');
            console.log('Payment details:', details);
            // You would typically send 'details' to your backend here
            // to verify and record the payment, and update the user's subscription.
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
      }).render(buttonContainerRef.current); // Render into the specific ref
    }
  }, [amount, planId]); // Re-run effect if amount or planId changes

  return (
    // This div is where the PayPal button will be rendered by the SDK
    <div ref={buttonContainerRef} style={{ width: '100%', minHeight: '40px' }}></div>
  );
};

export default PayPalButton; 