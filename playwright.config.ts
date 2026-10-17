import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  use: {
    browserName: 'chromium',
    launchOptions: {
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
})
