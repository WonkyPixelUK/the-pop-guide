import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'contact',
          to: formData.email,
          data: formData
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      contact: "hello@popguide.com"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 9 AM - 6 PM EST"
    }
  ];

  return (
    <>
      <SEO title="Contact | The Pop Guide" description="Contact The Pop Guide team." />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Get in <span className="text-orange-500">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Have questions, feedback, or need help? We're here to assist you with anything related to your collection.
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <info.icon className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
                    <p className="text-gray-400 mb-2">{info.description}</p>
                    <p className="text-orange-500 font-medium">{info.contact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-gray-300">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="faq-accordion">
                <AccordionItem value="faq1">
                  <AccordionTrigger>How does the 3-day trial work?</AccordionTrigger>
                  <AccordionContent>
                    You get full access to all Pro features for 3 days. Cancel anytime before the trial ends to avoid being charged.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq2">
                  <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent>
                    We accept all major credit/debit cards. For special billing, contact support.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq3">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes. We use enterprise-grade encryption and never share your collection data.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq4">
                  <AccordionTrigger>Can I export my collection?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can export your collection to CSV or access it via our API.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq5">
                  <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
                  <AccordionContent>
                    Yes! PopGuide works on web, iOS, Android, and as a PWA. Native apps are coming soon.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq6">
                  <AccordionTrigger>How do I get support?</AccordionTrigger>
                  <AccordionContent>
                    Use the contact form above or our live chat. We respond within 24 hours.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq7">
                  <AccordionTrigger>How do I become a retailer?</AccordionTrigger>
                  <AccordionContent>
                    Go to the "Become a Retailer" page, sign up, and follow the checkout process. Retailer status is granted after payment and approval.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
