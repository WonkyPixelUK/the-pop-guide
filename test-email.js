// Test script to verify Postmark email system
// Run with: node test-email.js

const testEmail = async () => {
  try {
    const response = await fetch('https://db.popguide.co.uk/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY_HERE' // Replace with your anon key
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'your-email@example.com', // Replace with your email
        data: {
          fullName: 'Test User'
        }
      })
    });

    const result = await response.text();
    console.log('Email test result:', result);
    
    if (response.ok) {
      console.log('✅ Email system is working!');
    } else {
      console.log('❌ Email system error:', result);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEmail(); 