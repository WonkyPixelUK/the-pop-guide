// Cron job configurations for scheduled edge functions
export const cronJobs = [
  {
    name: 'daily-funko-europe-scraper',
    schedule: '0 9 * * *', // Every day at 9:00 AM UTC
    function: 'scheduled-funko-europe-scraper',
    timezone: 'UTC',
    description: 'Daily scraping of Funko Europe products with email notifications'
  },
  // Add more cron jobs here as needed
  {
    name: 'weekly-ebay-bulk-scraper',
    schedule: '0 2 * * 0', // Every Sunday at 2:00 AM UTC  
    function: 'bulk-ebay-scraper',
    timezone: 'UTC',
    description: 'Weekly bulk eBay price updates'
  }
];

// Helper function to validate cron expressions
export function validateCronExpression(expression: string): boolean {
  const cronRegex = /^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)$/;
  return cronRegex.test(expression.trim());
}

// Helper function to get next execution time
export function getNextExecution(cronExpression: string): Date {
  // This is a simple implementation - for production use a proper cron parser library
  const now = new Date();
  const [minute, hour, day, month, weekday] = cronExpression.split(' ');
  
  // For daily at 9 AM: "0 9 * * *"
  if (minute === '0' && hour === '9' && day === '*' && month === '*' && weekday === '*') {
    const next = new Date();
    next.setHours(9, 0, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
  
  // For weekly on Sunday at 2 AM: "0 2 * * 0"  
  if (minute === '0' && hour === '2' && day === '*' && month === '*' && weekday === '0') {
    const next = new Date();
    next.setHours(2, 0, 0, 0);
    const daysUntilSunday = (7 - next.getDay()) % 7;
    if (daysUntilSunday === 0 && next <= now) {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + daysUntilSunday);
    }
    return next;
  }
  
  // Fallback: add 24 hours
  const fallback = new Date(now);
  fallback.setHours(fallback.getHours() + 24);
  return fallback;
} 