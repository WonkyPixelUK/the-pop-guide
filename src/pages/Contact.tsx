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
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      contact: "+1 (555) 123-4567"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our headquarters",
      contact: "San Francisco, CA"
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
              Common Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How do I add items to my collection?</h3>
                <p className="text-gray-400">Simply click the "Add Item" button in your dashboard and search for your Funko Pop or add custom items.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How often are prices updated?</h3>
                <p className="text-gray-400">Our pricing data is updated daily from multiple market sources to ensure accuracy.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I import my existing collection?</h3>
                <p className="text-gray-400">Yes! We support CSV imports and can help migrate from other collection apps.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is my data secure?</h3>
                <p className="text-gray-400">Absolutely. We use enterprise-grade encryption and never share your personal collection data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-bold mb-4">
                  <span className="text-orange-500">Pop</span>
                  <span className="text-white">Guide</span>
                </div>
                <p className="text-gray-400">
                  The ultimate platform for Funko Pop collectors.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/features" className="hover:text-orange-500">Features</Link></li>
                  <li><Link to="/pricing" className="hover:text-orange-500">Pricing</Link></li>
                  <li><Link to="/api" className="hover:text-orange-500">API</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/help" className="hover:text-orange-500">Help Center</Link></li>
                  <li><Link to="/contact" className="hover:text-orange-500">Contact Us</Link></li>
                  <li><Link to="/blog" className="hover:text-orange-500">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/about" className="hover:text-orange-500">About</Link></li>
                  <li><Link to="/privacy" className="hover:text-orange-500">Privacy</Link></li>
                  <li><Link to="/terms" className="hover:text-orange-500">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 PopGuide. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Contact;
