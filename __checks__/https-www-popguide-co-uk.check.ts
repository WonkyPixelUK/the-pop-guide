/**
* This is a Checkly CLI BrowserCheck construct. To learn more, visit:
* - https://www.checklyhq.com/docs/cli/
* - https://www.checklyhq.com/docs/cli/constructs-reference/#browsercheck
*/

import { BrowserCheck, Frequency, RetryStrategyBuilder } from 'checkly/constructs'

new BrowserCheck('https-www-popguide-co-uk', {
  name: 'https://www.popguide.co.uk',
  activated: true,
  muted: false,
  shouldFail: false,
  runParallel: true,
  locations: ['eu-west-2', 'eu-west-1'],
  tags: [],
  sslCheckDomain: '',
  frequency: Frequency.EVERY_5M,
  environmentVariables: [],
  code: {
    entrypoint: './https-www-popguide-co-uk.spec.ts',
  },
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    baseBackoffSeconds: 60,
    maxRetries: 2,
    maxDurationSeconds: 600,
    sameRegion: true,
  }),
}) 