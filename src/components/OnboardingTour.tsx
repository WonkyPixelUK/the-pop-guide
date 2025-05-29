import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to PopGuide!',
    content: "Track, value, and manage your Funko Pop collection. Let's take a quick tour!",
    disableBeacon: true,
  },
  {
    target: '[data-tour="browse-database"]',
    content: 'Browse the entire Funko Pop database and discover new releases.',
  },
  {
    target: '[data-tour="add-wishlist"]',
    content: 'Add Pops to your Wishlist to keep track of what you want.',
  },
  {
    target: '[data-tour="add-collection"]',
    content: 'Own a Pop? Add it to your Collection and track its value.',
  },
  {
    target: '[data-tour="lists"]',
    content: 'Organize Pops into custom Lists for trades, sales, or themes.',
  },
  {
    target: '[data-tour="value-history"]',
    content: 'See value history and trends for each Pop over time.',
  },
  {
    target: '[data-tour="notifications"]',
    content: 'Get notified about list transfers, offers, and more.',
  },
  {
    target: '[data-tour="profile"]',
    content: 'Edit your profile, manage lists, and show off your collection.',
  },
  {
    target: 'body',
    placement: 'center',
    title: 'All set!',
    content: "You're ready to start collecting. Enjoy PopGuide!",
    disableBeacon: true,
  },
];

const OnboardingTour = ({ run = false }: { run?: boolean }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (run) {
      setShow(true);
      return;
    }
    if (!localStorage.getItem('popguide_tour_seen')) {
      setShow(true);
    }
  }, [run]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setShow(false);
      localStorage.setItem('popguide_tour_seen', '1');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={show}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          primaryColor: '#e46c1b',
          backgroundColor: '#18181b',
          textColor: '#fff',
          zIndex: 9999,
        },
        tooltip: {
          backgroundColor: '#18181b',
          color: '#fff',
        },
        buttonNext: {
          backgroundColor: '#e46c1b',
          color: '#fff',
        },
        buttonBack: {
          color: '#e46c1b',
        },
      }}
      callback={handleJoyrideCallback}
      locale={{ last: 'Finish', skip: 'Skip', next: 'Next', back: 'Back' }}
    />
  );
};

export default OnboardingTour; 