import { spawn, spawnSync } from 'node:child_process'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const port = 4173
const origin = `http://127.0.0.1:${port}`
const routes = ['/', '/fitur', '/one-way', '/ritz', '/dictionary', '/guide', '/about', '/login', '/register']

function findChromium() {
  for (const command of ['chromium', 'chromium-browser', 'google-chrome']) {
    const result = spawnSync('which', [command], { encoding: 'utf8' })
    if (result.status === 0) return result.stdout.trim()
  }
  return process.env.CHROME_BIN || undefined
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(origin)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
  throw new Error('Vite preview tidak siap untuk prerender.')
}

function outputFile(route) {
  return route === '/' ? path.resolve('dist/index.html') : path.resolve('dist', route.slice(1), 'index.html')
}

async function assertReadable(file) {
  await access(file, constants.X_OK)
  return file
}

const executablePath = findChromium()
if (!executablePath) throw new Error('Chromium wajib tersedia untuk prerender. Nixpacks memasangnya melalui nixPkgs.')
await assertReadable(executablePath)

const preview = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: 'inherit',
})

let browser
try {
  await waitForPreview()
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  for (const route of routes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => !document.body.innerText.includes('Memuat layanan…'), { timeout: 10000 }).catch(() => {})
    const target = outputFile(route)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, await page.content(), 'utf8')
  }
} finally {
  await browser?.close()
  preview.kill('SIGTERM')
}
