import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const LogTicket = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16">
        <div className="container mx-auto max-w-xl">
          <h1 className="text-4xl font-bold text-center mb-8">Log a Ticket</h1>
          {submitted ? (
            <div className="text-center text-green-400 font-semibold py-12">Thank you! Your ticket has been submitted.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <div>
                <label htmlFor="name" className="block mb-1 text-gray-300">Name</label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 text-gray-300">Email</label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-1 text-gray-300">Subject</label>
                <Input id="subject" name="subject" value={form.subject} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <label htmlFor="message" className="block mb-1 text-gray-300">Message</label>
                <Textarea id="message" name="message" value={form.message} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white min-h-[120px]" required />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">Submit Ticket</Button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LogTicket; 