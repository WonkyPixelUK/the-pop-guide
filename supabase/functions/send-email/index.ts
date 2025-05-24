
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'contact' | 'reset' | 'milestone';
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
      case 'welcome':
        emailOptions = {
          from: "PopGuide <hello@popguide.com>",
          to: [to],
          subject: "Welcome to PopGuide! 🎉",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 40px; text-align: center;">
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
