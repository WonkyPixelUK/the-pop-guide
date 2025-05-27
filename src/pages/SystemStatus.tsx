import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const services = [
  { name: 'Droplets', status: 'Operational' },
  { name: 'VPC', status: 'Operational' },
  { name: 'Firewall', status: 'Operational' },
  { name: 'Datadroplets', status: 'Operational' },
  { name: 'DNS - Nameservers', status: 'Operational' },
  { name: 'CDN', status: 'Operational' },
  { name: 'Scraper', status: 'Operational' },
  { name: 'Login system', status: 'Operational' },
  { name: 'Payment gateway (Stripe)', status: 'Operational' },
  { name: 'Community forum', status: 'Operational' },
];

const SystemStatus = () => (
  <>
    <Navigation />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-8">System Status</h1>
        <div className="bg-gray-800/80 rounded-xl shadow-lg p-8 mb-8">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="pb-4 text-lg font-semibold text-white">Service</th>
                <th className="pb-4 text-lg font-semibold text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.name} className="border-b border-gray-700 last:border-b-0">
                  <td className="py-3 text-base text-gray-200">{service.name}</td>
                  <td className="py-3 flex items-center gap-2 text-green-400 font-medium">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
                    Operational
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-base">All core services are running smoothly. For real-time updates, check back here.</p>
      </div>
    </div>
    <Footer />
  </>
);

export default SystemStatus; 