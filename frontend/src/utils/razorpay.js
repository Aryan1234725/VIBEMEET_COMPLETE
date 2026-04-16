import { paymentAPI, handleApiError } from './api';

// ✅ USE SAME KEY AS BACKEND
const RAZORPAY_KEY_ID = 'rzp_test_Se7sxJASA7j3Cm';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpay = (orderData, plan, userData = {}) => {
  return new Promise((resolve, reject) => {

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,

      name: 'VIBEMEET',
      description: `${plan} Plan Subscription`,

      // ✅ FIXED: handler inside options
      handler: async function (response) {
        try {
          const verificationData = {
            plan,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          const res = await paymentAPI.verifyPayment(verificationData);
          resolve(res);
        } catch (err) {
          reject(err);
        }
      },

      prefill: {
        name: userData.name || '',
        email: userData.email || '',
        contact: userData.phone || '',
      },

      theme: { color: '#1a73e8' },

      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', function (response) {
      reject(new Error(response.error.description));
    });

    razorpay.open();
  });
};

export const processPayment = async (plan, userData = {}) => {
  try {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    const orderData = await paymentAPI.createOrder(plan);

    console.log("Order Data:", orderData); // DEBUG

    const result = await initializeRazorpay(orderData, plan, userData);

    return result;

  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  processPayment,
};