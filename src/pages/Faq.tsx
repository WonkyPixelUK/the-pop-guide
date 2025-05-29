import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const Faq = () => (
  <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 md:pb-0 text-white py-16">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
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
    </div>
    <Footer />
  </>
);

export default Faq; 