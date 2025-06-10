import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

interface EmailData {
  type: string;
  to: string;
  data: Record<string, any>;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // CORS headers for actual requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version',
  };

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  try {
    const { type, to, data } = await req.json() as EmailData;
    const POSTMARK_API_KEY = Deno.env.get('POSTMARK_API_KEY');
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://popguide.co.uk';

    if (!POSTMARK_API_KEY) {
      throw new Error('Postmark API key not configured');
    }

    if (!to || !type) {
      throw new Error('Missing required fields: to and type');
    }

    // Common email styling constants
    const primaryColor = '#f97316';
    const darkColor = '#1f2937';
    const baseUrl = SITE_URL;

    // Helper function to create consistent email template
    const createEmailTemplate = (title: string, header: string, content: string): string => {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, ${primaryColor}, #ea580c); padding: 30px 20px; text-align: center;">
              <img src="https://app-production-files.s3.amazonaws.com/02bc7e94-7a56-4e7a-ba1b-5e6ca1b1a789/logo-white.png" alt="PopGuide" style="height: 40px; margin-bottom: 15px;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${header}</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              ${content}
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                You're receiving this email because you have an account with PopGuide.
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                <a href="https://popguide.co.uk/unsubscribe" style="color: ${primaryColor}; text-decoration: none;">Unsubscribe</a> |
                <a href="https://popguide.co.uk/contact" style="color: ${primaryColor}; text-decoration: none;">Contact Support</a> |
                <a href="https://popguide.co.uk" style="color: ${primaryColor}; text-decoration: none;">PopGuide.co.uk</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    // Helper function to create action buttons
    const createButton = (text: string, url: string, backgroundColor: string = primaryColor): string => {
      return `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: ${backgroundColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${text}</a>
        </div>
      `;
    };

    // Define email templates based on type
    const getEmailTemplate = (type: string, data: Record<string, any>): EmailTemplate => {
    switch (type) {
        case 'welcome':
          return {
            subject: "🎯 Welcome to PopGuide - Your Funko Pop journey starts here!",
            html: createEmailTemplate(
              "🎯 Welcome to PopGuide",
              "Welcome to PopGuide! 🎯",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Welcome to PopGuide, the ultimate platform for Funko Pop collectors! 
                  We're thrilled to have you join our community of passionate collectors.
                </p>
                <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); border: 2px solid #f97316; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">🚀 Get Started:</h3>
                  <ul style="color: #ea580c; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Build your digital collection</li>
                    <li>Track prices and get alerts</li>
                    <li>Discover rare and exclusive Pops</li>
                    <li>Connect with fellow collectors</li>
                  </ul>
                </div>
                ${createButton("Start Building Your Collection", "https://popguide.co.uk/dashboard")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Questions? Our support team is here to help at <a href="mailto:support@popguide.co.uk" style="color: ${primaryColor};">support@popguide.co.uk</a>
                </p>
              `
            )
          };

      case 'confirmation':
          return {
            subject: "Please confirm your PopGuide email address ✉️",
            html: createEmailTemplate(
              "Please confirm your email address ✉️",
              "Confirm Your Email ✉️",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thanks for signing up for PopGuide! To complete your registration and start building your Funko Pop collection, 
                  please confirm your email address by clicking the button below.
                </p>
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                    <strong>⚡ Quick confirmation:</strong> This link will expire in 24 hours for security reasons.
                  </p>
                </div>
                ${createButton("Confirm Email Address", data.confirmationUrl)}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  If you didn't create an account with PopGuide, you can safely ignore this email.
                </p>
              `
            )
          };

        case 'reset':
          return {
            subject: "🔐 Reset Your PopGuide Password",
            html: createEmailTemplate(
              "🔐 Reset Your PopGuide Password",
              "Password Reset Request 🔐",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We received a request to reset your PopGuide password. If you made this request, 
                  click the button below to create a new password.
                </p>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Security Information:</h4>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Reset requested:</strong> ${data.requestTime || 'Just now'}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Link expires:</strong> In 1 hour for security</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>IP Address:</strong> ${data.ipAddress || 'Not available'}</p>
                </div>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for security reasons.
                </p>
                ${createButton("Reset My Password", data.resetUrl, "#dc2626")}
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>⚠️ Important:</strong> If you didn't request this password reset, please ignore this email and consider changing your password as a precaution. Your account is still secure.
                  </p>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need help? Contact our support team at <a href="mailto:support@popguide.co.uk" style="color: ${primaryColor};">support@popguide.co.uk</a>
                </p>
              `
            )
          };

        case 'magic_login':
          return {
            subject: "🪄 Your PopGuide Magic Login Code",
            html: createEmailTemplate(
              "🪄 Your PopGuide Magic Login Code",
              "Magic Login Code 🪄",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Here's your magic login code for PopGuide. Enter this code to sign in instantly - no password needed!
                </p>
                <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); border: 2px solid #f97316; padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">Your Magic Code:</h3>
                  <div style="font-size: 48px; font-weight: bold; color: #ea580c; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 20px 0;">
                    ${data.magicCode}
                  </div>
                  <p style="color: #ea580c; margin: 10px 0 0 0; font-size: 14px;">Expires in ${data.expiresIn}</p>
                </div>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Security Information:</h4>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Requested:</strong> ${data.requestTime || 'Just now'}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Valid for:</strong> ${data.expiresIn}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>One-time use:</strong> Code becomes invalid after use</p>
                </div>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Simply enter this 6-digit code on the PopGuide login page. If you didn't request this code, you can safely ignore this email.
                </p>
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>⚠️ Important:</strong> Never share this code with anyone. PopGuide will never ask for your magic code via phone or email.
                  </p>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need help? Contact our support team at <a href="mailto:support@popguide.co.uk" style="color: ${primaryColor};">support@popguide.co.uk</a>
                </p>
              `
            )
          };

        case 'milestone':
          return {
            subject: `🎉 Collection Milestone Reached: ${data.milestone}!`,
            html: createEmailTemplate(
              `🎉 Collection Milestone Reached: ${data.milestone}!`,
              "Amazing Achievement! 🎉",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Congratulations, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  You've reached an incredible milestone in your Funko Pop collection!
                </p>
                <div style="background: linear-gradient(135deg, #fef3cd, #fed7aa); border: 1px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px;">${data.milestone}</h3>
                  <p style="color: #92400e; margin: 0; font-size: 18px;">Collection Value: ${data.collectionValue}</p>
                  <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">${data.currentCount} items and counting!</p>
              </div>
                ${createButton("View Your Collection", "https://popguide.co.uk/dashboard")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Share your achievement with the community and keep building your collection!
                </p>
              `
            )
          };

        case 'pro_welcome':
          return {
            subject: "🚀 Welcome to PopGuide Pro!",
            html: createEmailTemplate(
              "🚀 Welcome to PopGuide Pro!",
              "Welcome to Pro! 🚀",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Welcome to the Pro experience, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for upgrading to PopGuide Pro! You now have access to all our premium features.
                </p>
                <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); border: 2px solid #f97316; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">🎯 Your Pro Features:</h3>
                  <ul style="color: #ea580c; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Unlimited collection tracking</li>
                    <li>Advanced analytics and insights</li>
                    <li>Price alerts and notifications</li>
                    <li>Priority customer support</li>
                    <li>Exclusive beta features</li>
                    <li>Export and backup tools</li>
                  </ul>
                </div>
                ${createButton("Explore Pro Features", "https://popguide.co.uk/dashboard?pro=true")}
              `
            )
          };

        case 'trial_ending':
          return {
            subject: "⏰ Your PopGuide Pro trial ends in 24 hours",
            html: createEmailTemplate(
              "⏰ Your PopGuide Pro trial ends in 24 hours",
              "Trial Ending Soon ⏰",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Don't lose your Pro features!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Your PopGuide Pro trial ends in <strong>24 hours</strong>. Upgrade now to continue enjoying unlimited access to all Pro features.
                </p>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">⚡ You'll lose access to:</h4>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li>Advanced collection analytics</li>
                    <li>Price alerts and notifications</li>
                    <li>Unlimited collection tracking</li>
                    <li>Priority customer support</li>
                  </ul>
                </div>
                ${createButton("Upgrade to Pro Now", "https://popguide.co.uk/auth?plan=pro")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Questions? <a href="https://popguide.co.uk/contact" style="color: ${primaryColor};">Contact our support team</a>
                </p>
              `
            )
          };

        case 'payment_failed':
          return {
            subject: "⚠️ Payment Failed - Action Required",
            html: createEmailTemplate(
              "⚠️ Payment Failed - Action Required",
              "Payment Failed ⚠️",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We had trouble processing your payment for PopGuide Pro. Your subscription is still active, but we'll need you to update your payment method.
                </p>
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #991b1b; margin: 0 0 10px 0;">⚠️ Payment Details:</h4>
                  <p style="margin: 5px 0; color: #991b1b;"><strong>Amount:</strong> ${data.amount}</p>
                  <p style="margin: 5px 0; color: #991b1b;"><strong>Failed on:</strong> ${data.failedDate}</p>
                  <p style="margin: 5px 0; color: #991b1b;"><strong>Reason:</strong> ${data.failureReason}</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  Please update your payment method within <strong>7 days</strong> to avoid service interruption.
                </p>
                ${createButton("Update Payment Method", "https://popguide.co.uk/profile?tab=subscription", "#dc2626")}
              `
            )
          };

        case 'subscription_canceled':
          return {
            subject: "Your PopGuide Pro subscription has been canceled",
            html: createEmailTemplate(
              "Your PopGuide Pro subscription has been canceled",
              "Subscription Canceled",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We're sorry to see you go! Your PopGuide Pro subscription has been successfully canceled.
                </p>
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #991b1b; margin: 0 0 10px 0;">📅 Important Information:</h4>
                  <p style="margin: 5px 0; color: #991b1b;"><strong>Access Until:</strong> ${data.accessUntil}</p>
                  <p style="margin: 5px 0; color: #991b1b;"><strong>Data Retention:</strong> Your collection data will be preserved</p>
              </div>
                <p style="color: #374151; line-height: 1.6;">
                  You'll continue to have access to Pro features until ${data.accessUntil}. After that, your account will revert to our free plan.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://popguide.co.uk/auth?plan=pro" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin-right: 10px;">Resubscribe</a>
                  <a href="https://popguide.co.uk/contact" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Contact Support</a>
            </div>
              `
            )
          };

        case 'payment_receipt':
          return {
            subject: "✅ Payment Received - PopGuide Pro",
            html: createEmailTemplate(
              "✅ Payment Received - PopGuide Pro",
              "Payment Confirmed ✅",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Thank you, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We've successfully processed your payment for PopGuide Pro.
                </p>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #166534; margin: 0 0 10px 0;">🧾 Receipt Details:</h4>
                  <p style="margin: 5px 0; color: #166534;"><strong>Amount:</strong> ${data.amount}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Date:</strong> ${data.date}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Next Billing:</strong> ${data.nextBilling}</p>
              </div>
                <p style="color: #374151; line-height: 1.6;">
                  Your Pro subscription is active and all features are available.
                </p>
                ${createButton("View Subscription", "https://popguide.co.uk/profile?tab=subscription")}
              `
            )
          };

        case 'invoice_reminder':
          return {
            subject: "💳 Payment Reminder - PopGuide Pro Subscription",
            html: createEmailTemplate(
              "💳 Payment Reminder - PopGuide Pro",
              "Payment Reminder 💳",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Your PopGuide Pro subscription payment is due soon.
                </p>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">📋 Payment Details:</h4>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Amount:</strong> ${data.amount}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Due Date:</strong> ${data.dueDate}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  To avoid service interruption, please ensure your payment method is up to date.
                </p>
                ${createButton("Update Payment", "https://popguide.co.uk/profile?tab=subscription")}
              `
            )
          };

        case 'price_threshold_reached':
          return {
            subject: "🎯 Price Alert: Market Threshold Reached!",
            html: createEmailTemplate(
              "🎯 Price Alert: Market Threshold Reached!",
              "Price Alert Triggered! 🎯",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Great news! A market price threshold you're monitoring has been reached.
                </p>
                <div style="background: linear-gradient(135deg, #fef3cd, #fed7aa); border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 20px;">${data.popName}</h3>
                  <p style="color: #92400e; margin: 0; font-size: 16px;"><strong>Series:</strong> ${data.series}</p>
                  <p style="color: #92400e; margin: 5px 0; font-size: 18px;"><strong>Current Price:</strong> ${data.currentPrice}</p>
                  <p style="color: #92400e; margin: 5px 0; font-size: 14px;">Threshold: ${data.threshold} (${data.direction})</p>
                </div>
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  This could be a great time to ${data.direction === 'above' ? 'sell' : 'buy'} or adjust your collection strategy!
                </p>
                ${createButton("View Price Details", `https://popguide.co.uk/pop/${data.popId}`)}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/profile?tab=alerts" style="color: ${primaryColor};">Manage your price alerts</a>
                </p>
              `
            )
          };

        case 'wishlist_price_drop':
          return {
            subject: "🔥 Wishlist Alert: Price Drop on ${data.popName}!",
            html: createEmailTemplate(
              "🔥 Wishlist Alert: Price Drop!",
              "Wishlist Price Drop! 🔥",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Great news, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  A Funko Pop on your wishlist just dropped in price! This could be your chance to add it to your collection.
                </p>
                <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 2px solid #16a34a; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 20px;">${data.popName}</h3>
                  <p style="color: #166534; margin: 0; font-size: 16px;"><strong>Series:</strong> ${data.series}</p>
                  <p style="color: #166534; margin: 10px 0; font-size: 18px;">
                    <span style="text-decoration: line-through; color: #991b1b;">${data.oldPrice}</span> 
                    → <strong style="color: #16a34a;">${data.newPrice}</strong>
                  </p>
                  <p style="color: #166534; margin: 5px 0; font-size: 14px;">You save: ${data.savings} (${data.percentage}% off)</p>
              </div>
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  Don't wait too long - popular Pops at great prices tend to sell quickly!
                </p>
                ${createButton("View Pop Details", `https://popguide.co.uk/pop/${data.popId}`)}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/wishlist" style="color: ${primaryColor};">View your full wishlist</a>
                </p>
              `
            )
          };

        case 'achievement_unlocked':
          return {
            subject: "🏆 Achievement Unlocked: ${data.achievementName}!",
            html: createEmailTemplate(
              "🏆 Achievement Unlocked!",
              "New Achievement! 🏆",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Congratulations, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  You've just unlocked a new achievement! Your dedication to collecting is paying off.
                </p>
                <div style="background: linear-gradient(135deg, #fef3cd, #fed7aa); border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 15px;">${data.badge || '🏆'}</div>
                  <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 24px;">${data.achievementName}</h3>
                  <p style="color: #92400e; margin: 0; font-size: 16px;">${data.description}</p>
                </div>
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  Keep up the fantastic work! There are more achievements waiting to be unlocked.
                </p>
                ${createButton("View All Achievements", "https://popguide.co.uk/achievements")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/dashboard" style="color: ${primaryColor};">Check your progress</a>
                </p>
              `
            )
          };

        // Support Ticket Email Templates
        case 'support_ticket_created':
          return {
            subject: `🎫 Support Ticket Created: ${data.ticketNumber}`,
            html: createEmailTemplate(
              `🎫 Support Ticket Created: ${data.ticketNumber}`,
              "Support Ticket Created 🎫",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for contacting PopGuide support! We've received your request and our team will respond as soon as possible.
                </p>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #166534; margin: 0 0 10px 0;">🎫 Ticket Details:</h4>
                  <p style="margin: 5px 0; color: #166534;"><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Subject:</strong> ${data.title}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Category:</strong> ${data.category.replace('_', ' ')}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Priority:</strong> ${data.priority || 'Medium'}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Expected Response:</strong> Within 24 hours</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  You can track the status of your ticket or add additional information by visiting your support dashboard.
                </p>
                ${createButton("View Ticket Status", "https://popguide.co.uk/dashboard?tab=support")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need urgent help? Email us directly at <a href="mailto:support@popguide.co.uk" style="color: ${primaryColor};">support@popguide.co.uk</a>
                </p>
              `
            )
          };

        case 'support_ticket_response':
          return {
            subject: `💬 Response to Ticket ${data.ticketNumber}: ${data.title}`,
            html: createEmailTemplate(
              `💬 Response to Ticket ${data.ticketNumber}`,
              "Support Response 💬",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Our support team has responded to your ticket. Here's the latest update:
                </p>
                <div style="background: #f3f4f6; border-left: 4px solid ${primaryColor}; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: ${darkColor}; margin: 0 0 10px 0;">📋 Ticket: ${data.ticketNumber}</h4>
                  <p style="margin: 5px 0; color: #374151;"><strong>Subject:</strong> ${data.title}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> ${data.status}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Agent:</strong> ${data.agentName || 'PopGuide Support'}</p>
                </div>
                <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: ${darkColor}; margin: 0 0 15px 0;">💬 Latest Response:</h4>
                  <div style="color: #374151; line-height: 1.6; white-space: pre-line;">${data.response}</div>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  ${data.status === 'resolved' ? 
                    'If this resolves your issue, you can close the ticket. Otherwise, feel free to reply with any questions.' :
                    'You can reply to this ticket or view the full conversation in your support dashboard.'
                  }
                </p>
                ${createButton("View Full Conversation", `https://popguide.co.uk/dashboard?tab=support&ticket=${data.ticketNumber}`)}
              `
            )
          };

        case 'support_ticket_resolved':
          return {
            subject: `✅ Ticket Resolved: ${data.ticketNumber} - ${data.title}`,
            html: createEmailTemplate(
              `✅ Ticket Resolved: ${data.ticketNumber}`,
              "Ticket Resolved ✅",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Great news! Your support ticket has been resolved by our team.
                </p>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #166534; margin: 0 0 10px 0;">✅ Resolution Summary:</h4>
                  <p style="margin: 5px 0; color: #166534;"><strong>Ticket:</strong> ${data.ticketNumber}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Subject:</strong> ${data.title}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Resolved by:</strong> ${data.agentName || 'PopGuide Support'}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Resolution:</strong> ${data.resolution}</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  If you're satisfied with the resolution, no further action is needed. The ticket will be automatically closed in 24 hours.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://popguide.co.uk/support/feedback?ticket=${data.ticketNumber}&rating=5" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin-right: 10px;">👍 Satisfied</a>
                  <a href="${data.reopenUrl || 'https://popguide.co.uk/dashboard?tab=support'}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">🔄 Reopen Ticket</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Your feedback helps us improve our support service.
                </p>
              `
            )
          };

        case 'feature_request_update':
          return {
            subject: `💡 Feature Request Update: ${data.title}`,
            html: createEmailTemplate(
              `💡 Feature Request Update: ${data.title}`,
              "Feature Request Update 💡",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We have an update on your feature request! Here's what's happening:
                </p>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">💡 Feature Request:</h4>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Title:</strong> ${data.title}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Status:</strong> ${data.status.replace('_', ' ').toUpperCase()}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Votes:</strong> ${data.votes || 0}</p>
                  ${data.estimatedRelease ? `<p style="margin: 5px 0; color: #92400e;"><strong>Estimated Release:</strong> ${data.estimatedRelease}</p>` : ''}
                </div>
                ${data.updateMessage ? `
                  <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: ${darkColor}; margin: 0 0 15px 0;">📝 Update Details:</h4>
                    <div style="color: #374151; line-height: 1.6; white-space: pre-line;">${data.updateMessage}</div>
                  </div>
                ` : ''}
                <p style="color: #374151; line-height: 1.6;">
                  ${data.status === 'approved' ? 'Your feature has been approved for development! 🎉' :
                    data.status === 'in_development' ? 'Development is underway! We\'ll keep you posted on progress.' :
                    data.status === 'testing' ? 'Your feature is now in testing phase. Release is coming soon!' :
                    data.status === 'released' ? 'Your feature is now live! Thank you for the suggestion.' :
                    'Thank you for your patience as we review your suggestion.'}
                </p>
                ${createButton("View Feature Request", `https://popguide.co.uk/features/${data.featureId}`)}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Have more ideas? <a href="https://popguide.co.uk/dashboard?tab=support" style="color: ${primaryColor};">Submit a feature request</a>
                </p>
              `
            )
          };

      default:
          throw new Error(`Unsupported email type: ${type}`);
    }
    };

    const emailTemplate = getEmailTemplate(type, data);

    // Send email via Postmark
    const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: 'hello@popguide.co.uk',
        To: to,
        Subject: emailTemplate.subject,
        HtmlBody: emailTemplate.html,
        MessageStream: 'outbound'
      }),
    });

    if (!postmarkResponse.ok) {
      const errorData = await postmarkResponse.text();
      console.error('Postmark API error:', errorData);
      throw new Error(`Postmark API error: ${postmarkResponse.status} - ${errorData}`);
    }

    const result = await postmarkResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully via Postmark' }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

