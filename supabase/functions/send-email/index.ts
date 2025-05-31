import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'contact' | 'reset' | 'milestone' | 'confirmation' | 'pro_welcome' | 'invoice_reminder' | 'payment_receipt' | 'crypto_payment_success' | 'crypto_payment_pending';
  to: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    // Get the correct base URL - use production URL or fallback to localhost
    const baseUrl = Deno.env.get("SITE_URL") || "https://popguide.lovable.app";

    let emailOptions;

    switch (type) {
      case 'confirmation':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "Confirm Your PopGuide Account ✉️",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 100px; margin-bottom: 20px;">
                <h1 style="color: #f97316; font-size: 28px; margin: 0;">Confirm Your Account</h1>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to PopGuide, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for signing up! Please confirm your email address by clicking the button below to activate your account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.confirmationUrl}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Confirm My Account</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${data.confirmationUrl}" style="color: #f97316; word-break: break-all;">${data.confirmationUrl}</a>
                </p>
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
                  If you didn't create this account, you can safely ignore this email.
                </p>
              </div>
            </div>
          `,
        };
        break;

      case 'welcome':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "Welcome to PopGuide! 🎉",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 100px; margin-bottom: 20px;">
                <h1 style="color: #f97316; font-size: 32px; margin: 0;">PopGuide</h1>
                <p style="color: #d1d5db; font-size: 18px; margin: 10px 0 0 0;">Your Ultimate Funko Pop Collection Manager</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to the Community, ${data.fullName || 'Collector'}!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for joining PopGuide! You're now part of a community of passionate Funko Pop collectors who are taking their hobby to the next level.
                </p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin-top: 0;">What you can do with PopGuide:</h3>
                  <ul style="color: #374151; line-height: 1.8;">
                    <li>📊 Track your entire collection with real-time values</li>
                    <li>📈 Monitor price trends and market insights</li>
                    <li>🎯 Set collection goals and milestones</li>
                    <li>📸 Upload photos and add personal notes</li>
                    <li>🔍 Discover new Pops to add to your wishlist</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/dashboard" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Start Building Your Collection</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need help getting started? Check out our <a href="${baseUrl}/help" style="color: #f97316;">Help Center</a> or reply to this email.
                </p>
              </div>
            </div>
          `,
        };
        break;

      case 'contact':
        emailOptions = {
          from: "PopGuide Contact <hello@popguide.com>",
          to: ["support@popguide.com"],
          subject: `New Contact Form Submission from ${data.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">New Contact Form Submission</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
                <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                  Submitted at: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `,
        };
        
        // Also send confirmation to user
        await resend.emails.send({
          from: "PopGuide <hello@popguide.com>",
          to: [data.email],
          subject: "We received your message!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 30px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 80px; margin-bottom: 10px;">
                <h1 style="color: #f97316; font-size: 28px; margin: 0;">PopGuide</h1>
              </div>
              <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1f2937;">Thank you for contacting us, ${data.name}!</h2>
                <p style="color: #374151; line-height: 1.6;">
                  We have received your message and will get back to you within 24 hours. 
                  Our team is dedicated to helping you make the most of your Funko Pop collection.
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Your message:</strong></p>
                  <p style="margin: 10px 0 0 0; color: #374151;">"${data.message}"</p>
                </div>
                <p style="color: #374151;">
                  Best regards,<br>
                  The PopGuide Team
                </p>
              </div>
            </div>
          `,
        });
        break;

      case 'milestone':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: `🎉 Collection Milestone Reached!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 100px; margin-bottom: 20px;">
                <h1 style="color: #f97316; font-size: 32px; margin: 0;">🎉 Milestone Reached!</h1>
              </div>
              <div style="padding: 40px; background: #ffffff; text-align: center;">
                <h2 style="color: #1f2937;">Congratulations, ${data.userName}!</h2>
                <p style="color: #374151; font-size: 18px; line-height: 1.6;">
                  You've just reached <strong>${data.milestone}</strong> Funko Pops in your collection!
                </p>
                <div style="background: #f97316; color: white; padding: 30px; border-radius: 50%; width: 100px; height: 100px; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold;">
                  ${data.count}
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  Your collection is now worth approximately <strong>$${data.totalValue}</strong>. 
                  Keep up the amazing work building your Funko Pop empire!
                </p>
                <div style="margin: 30px 0;">
                  <a href="${baseUrl}/dashboard" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Your Collection</a>
                </div>
              </div>
            </div>
          `,
        };
        break;

      case 'pro_welcome':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "Welcome to PopGuide Pro! 🎉",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 100px; margin-bottom: 20px;">
                <h1 style="color: #e46c1b; font-size: 32px; margin: 0;">Welcome to Pro!</h1>
                <p style="color: #d1d5db; font-size: 18px; margin: 10px 0 0 0;">You've unlocked all features.</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for upgrading to <strong>PopGuide Pro</strong>! You now have unlimited access, advanced analytics, and priority support.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/dashboard" style="background: #e46c1b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Need help? <a href="${baseUrl}/support" style="color: #e46c1b;">Contact us</a> anytime.
                </p>
              </div>
            </div>
          `,
        };
        break;

      case 'invoice_reminder':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "Your PopGuide Pro renewal is coming up",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 80px; margin-bottom: 20px;">
                <h1 style="color: #e46c1b; font-size: 28px; margin: 0;">Renewal Reminder</h1>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  This is a reminder that your <strong>PopGuide Pro</strong> subscription will renew on <strong>${data.renewalDate}</strong> for <strong>${data.amount}</strong>.
                </p>
                <p style="color: #374151;">No action is needed if you wish to continue. To manage your subscription, <a href="${baseUrl}/profile" style="color: #e46c1b;">visit your account</a>.</p>
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">If you have any questions, reply to this email.</p>
              </div>
            </div>
          `,
        };
        break;

      case 'payment_receipt':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "Your PopGuide Pro payment receipt",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 80px; margin-bottom: 20px;">
                <h1 style="color: #e46c1b; font-size: 28px; margin: 0;">Payment Receipt</h1>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${data.fullName || 'Collector'},</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for your payment of <strong>${data.amount}</strong> for your <strong>PopGuide Pro</strong> subscription.
                </p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Date:</strong> ${data.date}</p>
                </div>
                <p style="color: #374151;">If you have any questions, reply to this email or <a href="${baseUrl}/support" style="color: #e46c1b;">contact support</a>.</p>
              </div>
            </div>
          `,
        };
        break;

      case 'crypto_payment_success':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "🎉 Crypto Payment Confirmed - Welcome to PopGuide Pro!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 100px; margin-bottom: 20px;">
                <h1 style="color: #10b981; font-size: 32px; margin: 0;">🎉 Payment Confirmed!</h1>
                <p style="color: #d1d5db; font-size: 18px; margin: 10px 0 0 0;">Your crypto payment was successful</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Hi there!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  Congratulations! Your cryptocurrency payment has been confirmed on the blockchain and your <strong>PopGuide Pro</strong> subscription is now active.
                </p>
                <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                  <h3 style="margin: 0 0 10px 0; font-size: 24px;">✅ Payment Confirmed</h3>
                  <p style="margin: 0; opacity: 0.9;">Thanks for choosing crypto payments!</p>
                </div>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 15px 0; color: #1f2937;">Payment Details:</h4>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Amount (USD):</strong> $${data.amount} ${data.currency}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Crypto Amount:</strong> ${data.cryptoAmount} ${data.cryptoCurrency}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Transaction ID:</strong> ${data.chargeId}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>💰 Crypto Discount Applied:</strong> You saved 5% by paying with cryptocurrency!
                  </p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/dashboard" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Access Your Pro Features</a>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  You now have unlimited access to all PopGuide Pro features including unlimited collection tracking, advanced analytics, price predictions, and priority support.
                </p>
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  Questions about your payment? <a href="${baseUrl}/support" style="color: #f97316;">Contact our support team</a>
                </p>
              </div>
            </div>
          `,
        };
        break;

      case 'crypto_payment_pending':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "⏳ Crypto Payment Received - Awaiting Confirmation",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
                <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide" style="height: 100px; margin-bottom: 20px;">
                <h1 style="color: #f59e0b; font-size: 32px; margin: 0;">⏳ Payment Received</h1>
                <p style="color: #d1d5db; font-size: 18px; margin: 10px 0 0 0;">Awaiting blockchain confirmation</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Hi there!</h2>
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                  We've received your cryptocurrency payment for <strong>PopGuide Pro</strong>! Your transaction is currently being confirmed on the blockchain.
                </p>
                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #92400e;">🔄 Confirmation in Progress</h3>
                  <p style="margin: 0; color: #92400e;">
                    Crypto payments typically take 10-60 minutes to confirm depending on network congestion. We'll email you as soon as it's confirmed!
                  </p>
                </div>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 15px 0; color: #1f2937;">Payment Details:</h4>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Amount:</strong> $${data.amount} ${data.currency}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Transaction ID:</strong> ${data.chargeId}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> Awaiting confirmation</p>
                </div>
                <p style="color: #374151; line-height: 1.6;">
                  Once confirmed, you'll immediately have access to all PopGuide Pro features. Thank you for choosing cryptocurrency payments!
                </p>
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  Questions? <a href="${baseUrl}/support" style="color: #f97316;">Contact our support team</a>
                </p>
              </div>
            </div>
          `,
        };
        break;

      default:
        throw new Error('Invalid email type');
    }

    const result = await resend.emails.send(emailOptions);
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, id: result.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

