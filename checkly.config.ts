import { defineConfig } from 'checkly';

export default defineConfig({
  projectName: 'PopGuide Monitoring',
  checks: [
    './__checks__/https-www-popguide-co-uk.check.ts'
  ],
}); 