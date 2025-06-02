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
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
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
                  <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 22px;">${data.achievementName}</h3>
                  <p style="color: #92400e; margin: 0; font-size: 16px;">${data.description}</p>
                  ${data.reward ? `<p style="color: #92400e; margin: 10px 0; font-size: 14px;"><strong>Reward:</strong> ${data.reward}</p>` : ''}
                </div>
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  Keep collecting to unlock even more achievements and rewards!
                </p>
                ${createButton("View All Achievements", "https://popguide.co.uk/achievements")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Share your achievement with the PopGuide community!
                </p>
              `
            )
          };

        case 'rare_pop_notification':
          return {
            subject: "⚡ Rare Alert: ${data.popName} Now Available!",
            html: createEmailTemplate(
              "⚡ Rare Pop Alert!",
              "Rare Pop Available! ⚡",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Alert, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  A rare Funko Pop you've been tracking is now available! These don't come around often.
                </p>
                <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #dc2626; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 20px;">${data.popName}</h3>
                  <p style="color: #991b1b; margin: 0; font-size: 16px;"><strong>Series:</strong> ${data.series}</p>
                  <p style="color: #991b1b; margin: 10px 0; font-size: 18px;"><strong>Rarity:</strong> ${data.rarity}</p>
                  <p style="color: #991b1b; margin: 5px 0; font-size: 16px;"><strong>Current Price:</strong> ${data.price}</p>
                  ${data.limited ? `<p style="color: #991b1b; margin: 5px 0; font-size: 14px;"><strong>Limited:</strong> ${data.limited}</p>` : ''}
              </div>
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>⏰ Act fast:</strong> Rare Pops like this typically sell out quickly. Don't miss your chance!
                  </p>
            </div>
                ${createButton("View Rare Pop", `https://popguide.co.uk/pop/${data.popId}`, "#dc2626")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/rare" style="color: ${primaryColor};">Browse more rare Pops</a>
                </p>
              `
            )
          };

        case 'subscription_renewal':
          return {
            subject: "✅ PopGuide Pro Renewed Successfully",
            html: createEmailTemplate(
              "✅ PopGuide Pro Renewed Successfully",
              "Subscription Renewed! ✅",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Thank you, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Your PopGuide Pro subscription has been successfully renewed. You're all set to continue enjoying all Pro features!
                </p>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #166534; margin: 0 0 10px 0;">🎯 Renewal Details:</h4>
                  <p style="margin: 5px 0; color: #166534;"><strong>Plan:</strong> ${data.plan}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Amount:</strong> ${data.amount}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Renewed on:</strong> ${data.renewalDate}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Next renewal:</strong> ${data.nextRenewal}</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  Your Pro features are active and ready to use. Thank you for your continued support!
                </p>
                ${createButton("Access Pro Features", "https://popguide.co.uk/dashboard?pro=true")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Questions about your subscription? <a href="https://popguide.co.uk/contact" style="color: ${primaryColor};">Contact our support team</a>
                </p>
              `
            )
          };

      case 'crypto_payment_success':
          return {
            subject: "₿ Crypto Payment Confirmed - PopGuide Pro",
            html: createEmailTemplate(
              "₿ Crypto Payment Confirmed",
              "Crypto Payment Success! ₿",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Payment confirmed, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Your cryptocurrency payment for PopGuide Pro has been successfully confirmed on the blockchain.
                </p>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #166534; margin: 0 0 10px 0;">₿ Payment Details:</h4>
                  <p style="margin: 5px 0; color: #166534;"><strong>Amount:</strong> ${data.cryptoAmount} ${data.currency}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>USD Value:</strong> ${data.usdAmount}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Transaction ID:</strong> ${data.txHash}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Confirmations:</strong> ${data.confirmations}</p>
                  <p style="margin: 5px 0; color: #166534;"><strong>Network:</strong> ${data.network}</p>
              </div>
                <p style="color: #374151; line-height: 1.6;">
                  Your PopGuide Pro subscription is now active. All Pro features are available immediately.
                </p>
                ${createButton("View Subscription", "https://popguide.co.uk/profile?tab=subscription")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/payments" style="color: ${primaryColor};">View payment history</a>
                </p>
              `
            )
          };

        case 'crypto_payment_pending':
          return {
            subject: "⏳ Crypto Payment Processing - PopGuide Pro",
            html: createEmailTemplate(
              "⏳ Crypto Payment Processing",
              "Payment Processing ⏳",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We've received your cryptocurrency payment for PopGuide Pro and it's currently being processed on the blockchain.
                </p>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">⏳ Processing Details:</h4>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Amount:</strong> ${data.cryptoAmount} ${data.currency}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>USD Value:</strong> ${data.usdAmount}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Transaction ID:</strong> ${data.txHash}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Current Confirmations:</strong> ${data.confirmations}/${data.requiredConfirmations}</p>
                  <p style="margin: 5px 0; color: #92400e;"><strong>Status:</strong> Pending confirmation</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  Your Pro subscription will be activated automatically once the required confirmations are received. This typically takes ${data.estimatedTime}.
                </p>
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                    <strong>ℹ️ What's next:</strong> We'll send you a confirmation email once your payment is fully processed. No action needed from you!
                  </p>
                </div>
                ${createButton("Check Payment Status", "https://popguide.co.uk/payments")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Questions? <a href="https://popguide.co.uk/contact" style="color: ${primaryColor};">Contact our support team</a>
                </p>
              `
            )
          };

        case 'newsletter':
          return {
            subject: "📧 PopGuide Weekly: ${data.subject}",
            html: createEmailTemplate(
              "📧 PopGuide Weekly Newsletter",
              "This Week in Funko! 📧",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  ${data.intro || "Here's your weekly dose of Funko Pop news, trending collections, and community highlights!"}
                </p>
                ${data.featuredContent ? `
                  <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); border: 2px solid #f97316; padding: 25px; border-radius: 12px; margin: 25px 0;">
                    <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">🌟 Featured This Week:</h3>
                    <div style="color: #ea580c;">
                      ${data.featuredContent}
                    </div>
                  </div>
                ` : ''}
                ${data.trendingPops ? `
                  <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">📈 Trending This Week:</h4>
                    <div style="color: #0c4a6e;">
                      ${data.trendingPops}
                    </div>
                  </div>
                ` : ''}
                ${data.communitySpotlight ? `
                  <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #166534; margin: 0 0 10px 0;">👥 Community Spotlight:</h4>
                    <div style="color: #166534;">
                      ${data.communitySpotlight}
                    </div>
                  </div>
                ` : ''}
                ${createButton("Read Full Newsletter", "https://popguide.co.uk/newsletter")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/newsletter/unsubscribe" style="color: ${primaryColor};">Unsubscribe from newsletter</a> | 
                  <a href="https://popguide.co.uk/newsletter/preferences" style="color: ${primaryColor};">Update preferences</a>
                </p>
              `
            )
          };

        case 'special_promotion':
          return {
            subject: "🎉 Special Offer: ${data.promoTitle}",
            html: createEmailTemplate(
              "🎉 Special Promotion!",
              "Limited Time Offer! 🎉",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Exclusive offer for you, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  ${data.description || "We have an amazing limited-time offer just for PopGuide collectors!"}
                </p>
                <div style="background: linear-gradient(135deg, #fef3cd, #fed7aa); border: 2px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px;">${data.promoTitle}</h3>
                  <p style="color: #92400e; margin: 0; font-size: 18px;"><strong>${data.discount}</strong></p>
                  ${data.promoCode ? `<p style="color: #92400e; margin: 10px 0; font-size: 16px;">Code: <strong>${data.promoCode}</strong></p>` : ''}
                  ${data.validUntil ? `<p style="color: #92400e; margin: 5px 0; font-size: 14px;">Valid until: ${data.validUntil}</p>` : ''}
                </div>
                ${data.highlights ? `
                  <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #991b1b; margin: 0 0 10px 0;">🔥 What's Included:</h4>
                    <ul style="color: #991b1b; margin: 0; padding-left: 20px;">
                      ${data.highlights.split(',').map(item => `<li>${item.trim()}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>⏰ Limited time:</strong> This offer expires soon. Don't miss out!
                  </p>
                </div>
                ${createButton("Claim Your Offer", data.promoUrl || "https://popguide.co.uk/promotions", "#dc2626")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/promotions" style="color: ${primaryColor};">View all current offers</a>
                </p>
              `
            )
          };

        case 'community_spotlight':
          return {
            subject: "⭐ Community Spotlight: ${data.collectorName}'s Amazing Collection!",
            html: createEmailTemplate(
              "⭐ Community Spotlight",
              "Featured Collector! ⭐",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  This week we're highlighting an incredible collection from our community member <strong>${data.collectorName}</strong>!
                </p>
                <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); border: 2px solid #f97316; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 20px;">${data.collectorName}'s Collection</h3>
                  <p style="color: #ea580c; margin: 0; font-size: 16px;"><strong>Total Pops:</strong> ${data.totalPops}</p>
                  <p style="color: #ea580c; margin: 5px 0; font-size: 16px;"><strong>Collection Value:</strong> ${data.collectionValue}</p>
                  <p style="color: #ea580c; margin: 5px 0; font-size: 16px;"><strong>Favorite Series:</strong> ${data.favoriteSeries}</p>
                  ${data.rareFinds ? `<p style="color: #ea580c; margin: 5px 0; font-size: 14px;"><strong>Rare Finds:</strong> ${data.rareFinds}</p>` : ''}
                </div>
                ${data.collectorQuote ? `
                  <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0; color: #0c4a6e; font-style: italic;">"${data.collectorQuote}"</p>
                    <p style="margin: 10px 0 0 0; color: #0c4a6e; font-size: 14px; text-align: right;">- ${data.collectorName}</p>
                  </div>
                ` : ''}
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  Want to be featured in our community spotlight? Share your collection with us!
                </p>
                ${createButton("View Full Collection", `https://popguide.co.uk/collector/${data.collectorId}`)}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://popguide.co.uk/community" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin-right: 10px;">Join Community</a>
                  <a href="https://popguide.co.uk/share-collection" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Share Your Collection</a>
                </div>
              `
            )
          };

        case 'beta_feature_invite':
          return {
            subject: "🚀 Beta Access: Try ${data.featureName} Early!",
            html: createEmailTemplate(
              "🚀 Beta Feature Access",
              "Exclusive Beta Access! 🚀",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  You've been selected for exclusive early access to our newest feature: <strong>${data.featureName}</strong>!
                </p>
                <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #dc2626; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 22px;">${data.featureName}</h3>
                  <p style="color: #991b1b; margin: 0; font-size: 16px;">${data.description}</p>
                </div>
                ${data.benefits ? `
                  <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #166534; margin: 0 0 10px 0;">✨ What You'll Get:</h4>
                    <ul style="color: #166534; margin: 0; padding-left: 20px;">
                      ${data.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">🎯 Why You?</h4>
                  <p style="margin: 0; color: #92400e;">You were selected based on your ${data.selectionReason || 'active engagement and valuable feedback to our community'}.</p>
                </div>
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  Ready to be among the first to experience this exciting new feature?
                </p>
                ${createButton("Access Beta Feature", data.betaUrl || "https://popguide.co.uk/beta", "#dc2626")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/beta/feedback" style="color: ${primaryColor};">Share your feedback</a> | 
                  <a href="https://popguide.co.uk/beta/info" style="color: ${primaryColor};">Learn about beta program</a>
                </p>
              `
            )
          };

        case 'friend_request_accepted':
          return {
            subject: "🤝 ${data.friendName} accepted your friend request!",
            html: createEmailTemplate(
              "🤝 Friend Request Accepted",
              "New Friend! 🤝",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Great news, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  <strong>${data.friendName}</strong> has accepted your friend request on PopGuide!
                </p>
                <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 2px solid #16a34a; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 20px;">${data.friendName}</h3>
                  ${data.friendStats ? `
                    <p style="color: #166534; margin: 0; font-size: 16px;"><strong>Collection Size:</strong> ${data.friendStats.totalPops} Pops</p>
                    <p style="color: #166534; margin: 5px 0; font-size: 16px;"><strong>Collection Value:</strong> ${data.friendStats.collectionValue}</p>
                    <p style="color: #166534; margin: 5px 0; font-size: 14px;"><strong>Favorite Series:</strong> ${data.friendStats.favoriteSeries}</p>
                  ` : ''}
                </div>
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">🎉 Now you can:</h4>
                  <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                    <li>View each other's collections</li>
                    <li>Compare collections and find duplicates</li>
                    <li>Get notified of their new additions</li>
                    <li>Share collecting tips and recommendations</li>
                  </ul>
              </div>
                ${createButton("View Friend's Collection", `https://popguide.co.uk/collector/${data.friendId}`)}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://popguide.co.uk/friends" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin-right: 10px;">View All Friends</a>
                  <a href="https://popguide.co.uk/compare/${data.friendId}" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Compare Collections</a>
            </div>
              `
            )
          };

        case 'new_follower':
          return {
            subject: "👥 ${data.followerName} is now following your collection!",
            html: createEmailTemplate(
              "👥 New Follower",
              "New Follower! 👥",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  <strong>${data.followerName}</strong> is now following your PopGuide collection!
                </p>
                <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); border: 2px solid #f97316; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 20px;">${data.followerName}</h3>
                  ${data.followerStats ? `
                    <p style="color: #ea580c; margin: 0; font-size: 16px;"><strong>Collection Size:</strong> ${data.followerStats.totalPops} Pops</p>
                    <p style="color: #ea580c; margin: 5px 0; font-size: 16px;"><strong>Joined:</strong> ${data.followerStats.joinDate}</p>
                    <p style="color: #ea580c; margin: 5px 0; font-size: 14px;"><strong>Favorite Series:</strong> ${data.followerStats.favoriteSeries}</p>
                  ` : ''}
                </div>
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  They'll be notified when you add new Pops to your collection. Why not check out theirs too?
                </p>
                ${createButton("View Their Collection", `https://popguide.co.uk/collector/${data.followerId}`)}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://popguide.co.uk/followers" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin-right: 10px;">View All Followers</a>
                  <a href="https://popguide.co.uk/follow/${data.followerId}" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Follow Back</a>
                </div>
              `
            )
          };

        case 'feature_announcement':
          return {
            subject: "🎉 New Feature: ${data.featureName} is Here!",
            html: createEmailTemplate(
              "🎉 New Feature Launch",
              "Exciting Update! 🎉",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We're excited to announce a brand new feature that will enhance your PopGuide experience!
                </p>
                <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #dc2626; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 24px;">${data.featureName}</h3>
                  <p style="color: #991b1b; margin: 0; font-size: 16px;">${data.description}</p>
                </div>
                ${data.keyFeatures ? `
                  <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #166534; margin: 0 0 10px 0;">✨ Key Features:</h4>
                    <ul style="color: #166534; margin: 0; padding-left: 20px;">
                      ${data.keyFeatures.split(',').map(feature => `<li>${feature.trim()}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                ${data.benefits ? `
                  <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0;">🎯 How It Helps:</h4>
                    <p style="margin: 0; color: #92400e;">${data.benefits}</p>
                  </div>
                ` : ''}
                <p style="color: #374151; line-height: 1.6; text-align: center;">
                  The feature is now live and ready for you to explore!
                </p>
                ${createButton("Try It Now", data.featureUrl || "https://popguide.co.uk/dashboard", "#dc2626")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  <a href="https://popguide.co.uk/help" style="color: ${primaryColor};">Need help?</a> | 
                  <a href="https://popguide.co.uk/feedback" style="color: ${primaryColor};">Share feedback</a>
                </p>
              `
            )
        };

        case 'scraper_success':
          return {
            subject: "✅ Bulk Scraper Completed Successfully",
            html: createEmailTemplate(
              "✅ Bulk Scraper Completed Successfully",
              "Scraper Success! ✅",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Bulk Scraper Completed</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Great news! The <strong>${data.scraper_type}</strong> has completed successfully.
                </p>
                <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 2px solid #16a34a; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">📊 Scraping Results</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #166534;">
                    <div style="text-align: center; padding: 10px; background: rgba(22, 101, 52, 0.1); border-radius: 6px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${data.total_processed}</div>
                      <div style="font-size: 14px;">Items Processed</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(22, 101, 52, 0.1); border-radius: 6px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${data.successful_items}</div>
                      <div style="font-size: 14px;">Successful</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(22, 101, 52, 0.1); border-radius: 6px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${data.prices_collected}</div>
                      <div style="font-size: 14px;">Prices Collected</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(22, 101, 52, 0.1); border-radius: 6px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${data.success_rate}%</div>
                      <div style="font-size: 14px;">Success Rate</div>
                    </div>
                  </div>
                </div>
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                    <strong>⏱️ Duration:</strong> ${data.duration} | 
                    <strong>📅 Completed:</strong> ${new Date(data.completion_time).toLocaleString()}
                  </p>
                  ${data.failed_items > 0 ? `
                    <p style="margin: 10px 0 0 0; color: #dc2626; font-size: 14px;">
                      <strong>⚠️ Failed Items:</strong> ${data.failed_items} items couldn't be processed
                    </p>
                  ` : ''}
                </div>
                ${createButton("View Pricing Dashboard", data.dashboard_url, "#16a34a")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  The updated prices are now available in your PopGuide dashboard.
                </p>
              `
            )
          };

        case 'scraper_failure':
          return {
            subject: "❌ Bulk Scraper Failed",
            html: createEmailTemplate(
              "❌ Bulk Scraper Failed",
              "Scraper Failed ❌",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">Bulk Scraper Failed</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Unfortunately, the <strong>${data.scraper_type}</strong> encountered an error and could not complete.
                </p>
                <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #dc2626; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px;">🚨 Error Details</h3>
                  <div style="background: rgba(153, 27, 27, 0.1); padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <code style="color: #991b1b; font-family: monospace; font-size: 14px; white-space: pre-wrap;">${data.error_message || 'Unknown error occurred'}</code>
                  </div>
                  <div style="color: #991b1b;">
                    <p style="margin: 10px 0;"><strong>⏱️ Failed after:</strong> ${data.duration || 'Unknown'}</p>
                    <p style="margin: 10px 0;"><strong>📅 Failed at:</strong> ${new Date(data.completion_time).toLocaleString()}</p>
                  </div>
                </div>
                ${data.total_processed > 0 ? `
                  <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0;">📊 Partial Progress Made:</h4>
                    <div style="color: #92400e;">
                      <p style="margin: 5px 0;"><strong>Items Processed:</strong> ${data.total_processed} / ${data.total_processed + data.failed_items}</p>
                      <p style="margin: 5px 0;"><strong>Successful:</strong> ${data.successful_items}</p>
                      <p style="margin: 5px 0;"><strong>Prices Collected:</strong> ${data.prices_collected}</p>
                    </div>
                  </div>
                ` : ''}
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">🔧 Next Steps:</h4>
                  <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                    <li>Check the pricing dashboard for any partial results</li>
                    <li>Review the error details above</li>
                    <li>Try running the scraper again after a few minutes</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
                ${createButton("View Pricing Dashboard", data.dashboard_url, "#dc2626")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need help? Contact support at <a href="mailto:support@popguide.co.uk" style="color: ${primaryColor};">support@popguide.co.uk</a>
                </p>
              `
            )
          };

        case 'ociostock_success':
          return {
            subject: "🎉 OcioStock Coming Soon Scraper Completed",
            html: createEmailTemplate(
              "🎉 OcioStock Scraper Success",
              "New Releases Found! 🎉",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">OcioStock Scraper Completed</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Great news! The OcioStock coming soon scraper has discovered <strong>${data.itemsScraped}</strong> new upcoming Funko releases.
                </p>
                <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 2px solid #16a34a; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">🛍️ Wholesale Discovery Results</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #166534;">
                    <div style="text-align: center; padding: 10px; background: rgba(22, 101, 52, 0.1); border-radius: 6px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${data.itemsScraped}</div>
                      <div style="font-size: 14px;">Coming Soon Items</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(22, 101, 52, 0.1); border-radius: 6px;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">🇪🇸</div>
                      <div style="font-size: 14px;">Spain B2B Market</div>
                    </div>
                  </div>
                </div>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">🎯 What This Means:</h4>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li>Early intelligence on upcoming Funko releases</li>
                    <li>Wholesale pricing information for market analysis</li>
                    <li>Release date tracking for collection planning</li>
                    <li>Competitive advantage for retailers and collectors</li>
                  </ul>
                </div>
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                    <strong>📅 Scraped:</strong> ${new Date(data.timestamp).toLocaleString()} | 
                    <strong>🌐 Source:</strong> OcioStock B2B Platform
                  </p>
                </div>
                ${createButton("View Coming Soon Releases", "https://popguide.co.uk/coming-soon", "#16a34a")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  The new releases are now available in your PopGuide coming soon dashboard.
                </p>
              `
            )
          };

        case 'ociostock_failure':
          return {
            subject: "❌ OcioStock Scraper Failed",
            html: createEmailTemplate(
              "❌ OcioStock Scraper Failed",
              "Scraper Error ❌",
              `
                <h2 style="color: ${darkColor}; margin-bottom: 20px;">OcioStock Scraper Failed</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Unfortunately, the OcioStock coming soon scraper encountered an error and could not complete.
                </p>
                <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #dc2626; padding: 25px; border-radius: 12px; margin: 25px 0;">
                  <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px;">🚨 Error Details</h3>
                  <div style="background: rgba(153, 27, 27, 0.1); padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <code style="color: #991b1b; font-family: monospace; font-size: 14px; white-space: pre-wrap;">${data.error_message || 'Authentication or scraping error occurred'}</code>
                  </div>
                  <div style="color: #991b1b;">
                    <p style="margin: 10px 0;"><strong>📅 Failed at:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                    <p style="margin: 10px 0;"><strong>🌐 Source:</strong> OcioStock B2B Platform</p>
                  </div>
                </div>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #92400e; margin: 0 0 10px 0;">🔍 Possible Causes:</h4>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li>Authentication credentials may have expired</li>
                    <li>OcioStock website structure changes</li>
                    <li>Network connectivity issues</li>
                    <li>Rate limiting or anti-bot protection</li>
                  </ul>
                </div>
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px;">
                  <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">🔧 Next Steps:</h4>
                  <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                    <li>Verify OcioStock login credentials are still valid</li>
                    <li>Check if the website layout has changed</li>
                    <li>Try running the scraper again after a few minutes</li>
                    <li>Contact support if authentication issues persist</li>
                  </ul>
                </div>
                ${createButton("View Coming Soon Dashboard", "https://popguide.co.uk/coming-soon", "#dc2626")}
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need help? Contact support at <a href="mailto:support@popguide.co.uk" style="color: ${primaryColor};">support@popguide.co.uk</a>
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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

