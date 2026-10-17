import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  use: {
    browserName: 'chromium',
    launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] },
  },
})
