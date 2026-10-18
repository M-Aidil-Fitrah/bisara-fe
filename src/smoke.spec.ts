import { test, expect } from '@playwright/test'

const baseUrl = 'http://localhost:5173'

test('public service routes load and preserve accessible navigation', async ({ page }) => {
  await page.goto(baseUrl)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Fitur' }).hover()
  const featureMenu = page.locator('#menu-fitur')
  const featureLink = featureMenu.getByRole('link', { name: /One-way Service/ })
  await expect(featureLink).toBeVisible()
  await expect(featureMenu.getByText('Fitur layanan two-way')).toBeVisible()
  await expect(featureMenu.getByRole('link', { name: /Two-way Service/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(featureLink).toBeHidden()
  await page.goto(`${baseUrl}/one-way`)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('One-way Service')
  await expect(page.getByLabel('Teks untuk layar')).toBeVisible()
  await page.goto(`${baseUrl}/ritz`)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Ritz')
  await expect(page.getByRole('heading', { name: 'Layanan psikolog BISARA.' })).toBeVisible()
  await page.goto(`${baseUrl}/two-way/resepsionis`)
  await expect(page.getByRole('heading', { name: 'Layanan Resepsionis' })).toBeVisible()
})

test('ADMIN can wait safely and pair with the next USER in a Ritz room', async ({ browser }) => {
  const email = process.env.BISARA_SMOKE_ADMIN_EMAIL
  const password = process.env.BISARA_SMOKE_ADMIN_PASSWORD
  if (!email || !password) {
    test.skip(true, 'Kredensial admin smoke tidak tersedia')
    return
  }
  const user = await browser.newContext({ permissions: ['camera', 'microphone'] }); const admin = await browser.newContext({ permissions: ['camera', 'microphone'] })
  const userPage = await user.newPage(); const adminPage = await admin.newPage()
  const memberEmail = `smoke-${Date.now()}@example.test`
  try {
    await adminPage.goto(`${baseUrl}/login`)
    await adminPage.getByLabel('Email').fill(email)
    await adminPage.locator('input[type="password"]').fill(password)
    await adminPage.getByRole('button', { name: 'Masuk' }).click()
    await adminPage.getByRole('button', { name: 'Masuk antrean layanan' }).click()
    await expect(adminPage.getByText('Mencari pendamping Ritz…')).toBeVisible()
    await expect(adminPage.getByRole('alert')).toHaveCount(0)

    await userPage.goto(`${baseUrl}/register`)
    await userPage.getByLabel('Nama lengkap').fill('Smoke User')
    await userPage.getByLabel('Email').fill(memberEmail)
    await userPage.locator('input[type="password"]').fill('SmokePassword123!')
    await userPage.getByRole('button', { name: 'Daftar' }).click()
    await userPage.getByRole('button', { name: 'Masuk antrean layanan' }).click()
    await expect(userPage.getByText('Menunggu pendamping Ritz.')).toBeVisible()
    await expect(adminPage.getByText('Pilih jawaban Anda')).toBeVisible({ timeout: 15_000 })
    await expect(userPage.getByText('Pilih jawaban Anda')).toBeVisible({ timeout: 15_000 })
    await expect(userPage.locator('video')).toHaveCount(2)
    await expect(userPage.getByText('Live Video')).toBeVisible({ timeout: 20_000 })
    await expect(adminPage.getByText('Live Video')).toBeVisible({ timeout: 20_000 })
    await expect(userPage.getByText('Chat sementara aktif')).toBeVisible({ timeout: 15_000 })
    await expect(adminPage.getByText('Chat sementara aktif')).toBeVisible({ timeout: 15_000 })
    await userPage.getByLabel('Pesan chat').fill('Pesan smoke sementara')
    await userPage.getByRole('button', { name: 'Kirim' }).click()
    await expect(adminPage.getByText('Smoke User: Pesan smoke sementara')).toBeVisible({ timeout: 15_000 })
    await userPage.getByRole('button', { name: 'Akhiri layanan' }).click()
    await expect(userPage).toHaveURL(`${baseUrl}/ritz`)
  } finally {
    await user.close()
    await admin.close()
  }
})
