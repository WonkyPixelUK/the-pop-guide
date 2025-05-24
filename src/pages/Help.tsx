import React from 'react';

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-4">Maintenance & Archive</h1>
        <p className="text-lg text-gray-300 mb-8">
          This page provides information about scheduled maintenance, data archiving, and any ongoing or upcoming changes to PopGuide. Please check back here for updates if you experience any issues or need to reference past maintenance events.
        </p>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-400 mb-2">Current Maintenance Notices</h2>
          <div className="bg-gray-800/70 border border-gray-700 rounded p-4 text-gray-200">
            <p>No active maintenance at this time. All systems are operational.</p>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-orange-400 mb-2">Archive & Past Events</h2>
          <div className="bg-gray-800/70 border border-gray-700 rounded p-4 text-gray-200">
            <ul className="list-disc pl-5 space-y-2">
              <li>2024-06-01: Major database upgrade completed successfully.</li>
              <li>2024-05-15: Scheduled downtime for infrastructure improvements (completed).</li>
              <li>2024-04-10: Price scraping system overhaul and migration.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Help; 