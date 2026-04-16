import { paymentAPI, handleApiError } from './api';

// Razorpay configuration
const RAZORPAY_KEY_ID = 'rzp_test_SOJOanpM6ANM4k';

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initializeRazorpay = async (orderData, plan) => {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'VIBEMEET',
    description: `${plan} Plan Subscription`,
    order_id: orderData.orderId,
    handler: async function (response) {
      try {
        // Verify payment with backend
        const verificationData = {
          plan,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };

        const verificationResponse = await paymentAPI.verifyPayment(verificationData);
        
        // Show success message
        alert('Payment successful! Your subscription has been upgraded.');
        
        // Redirect to home page
        window.location.href = '/home';
        
        return verificationResponse;
      } catch (error) {
        console.error('Payment verification failed:', error);
        alert('Payment verification failed. Please contact support.');
        throw error;
      }
    },
    prefill: {
      name: '', // Will be filled from user data
      email: '', // Will be filled from user data
      contact: '', // Optional phone number
    },
    notes: {
      plan: plan,
    },
    theme: {
      color: '#1a73e8', // Google Meet blue color
    },
    modal: {
      ondismiss: function () {
        console.log('Payment modal dismissed');
      },
      escape: true,
      backdropclose: false,
      handleback: true,
      confirmclose: true,
      animation: 'slide',
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

// Process payment for a plan
export const processPayment = async (plan, userData = {}) => {
  try {
    // Step 1: Create order from backend
    const orderData = await paymentAPI.createOrder(plan);
    
    // Step 2: Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load payment gateway. Please try again.');
    }
    
    // Step 3: Initialize payment with user data
    const options = {
      ...orderData,
      prefill: {
        name: userData.name || '',
        email: userData.email || '',
        contact: userData.phone || '',
      },
    };
    
    await initializeRazorpay(options, plan);
    
  } catch (error) {
    throw handleApiError(error);
  }
};

// Check if user has active subscription
export const checkSubscriptionStatus = () => {
  // This would typically check with the backend
  // For now, we'll use localStorage as a simple check
  const subscriptionStatus = localStorage.getItem('subscriptionStatus');
  return subscriptionStatus === 'PRO';
};

const RazorpayUtils = {
  loadRazorpayScript,
  initializeRazorpay,
  processPayment,
  checkSubscriptionStatus,
};

export default RazorpayUtils;
