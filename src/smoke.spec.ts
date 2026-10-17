import { test, expect } from '@playwright/test'

const baseUrl = 'http://localhost:5173'

test('public service routes load and preserve accessible navigation', async ({ page }) => {
  await page.goto(baseUrl)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Fitur' }).click()
  const featureLink = page.getByRole('link', { name: 'One-way Service Editor teks dan layar avatar privat.' })
  await expect(featureLink).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(featureLink).toBeHidden()
  await page.goto(`${baseUrl}/one-way`)
  await expect(page.getByLabel('Teks untuk layar')).toBeVisible()
  await page.goto(`${baseUrl}/ritz`)
  await expect(page.getByRole('heading', { name: 'Layanan Psikolog bersama Ritz.' })).toBeVisible()
})

test('USER and ADMIN are paired into an active Ritz room', async ({ browser }) => {
  const email = process.env.BISARA_SMOKE_ADMIN_EMAIL
  const password = process.env.BISARA_SMOKE_ADMIN_PASSWORD
  test.skip(!email || !password, 'Kredensial admin smoke tidak tersedia')
  const user = await browser.newContext(); const admin = await browser.newContext()
  const userPage = await user.newPage(); const adminPage = await admin.newPage()
  const memberEmail = `smoke-${Date.now()}@example.test`
  await userPage.goto(`${baseUrl}/register`)
  await userPage.getByLabel('Nama lengkap').fill('Smoke User')
  await userPage.getByLabel('Email').fill(memberEmail)
  await userPage.locator('input[type="password"]').fill('SmokePassword123!')
  await userPage.getByRole('button', { name: 'Daftar' }).click()
  await userPage.getByRole('button', { name: 'Masuk antrean layanan' }).click()
  await expect(userPage.getByText('Menunggu pendamping Ritz.')).toBeVisible()
  await adminPage.goto(`${baseUrl}/login`)
  await adminPage.getByLabel('Email').fill(email)
  await adminPage.locator('input[type="password"]').fill(password)
  await adminPage.getByRole('button', { name: 'Masuk' }).click()
  await adminPage.getByRole('button', { name: 'Masuk antrean layanan' }).click()
  await expect(adminPage.getByText('Pilih jawaban Anda')).toBeVisible({ timeout: 10_000 })
  await expect(userPage.getByText('Pilih jawaban Anda')).toBeVisible({ timeout: 10_000 })
  await user.close(); await admin.close()
})
