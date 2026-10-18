import { test, expect } from '@playwright/test'

const baseUrl = 'http://localhost:5173'

test('public service routes load and preserve accessible navigation', async ({ page }) => {
  await page.goto(baseUrl)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Fitur' }).click()
  const featureMenu = page.locator('#menu-fitur')
  const featureLink = featureMenu.getByRole('link', { name: /One-way Service/ })
  await expect(featureLink).toBeVisible()
  await expect(featureMenu.getByRole('link', { name: /Two-way Service/ })).toBeVisible()
  await expect(featureMenu.getByRole('link', { name: 'Layanan Psikolog' })).toBeVisible()
  await expect(featureMenu.getByRole('link', { name: 'Layanan Resepsionis' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(featureLink).toBeHidden()
  await page.goto(`${baseUrl}/one-way`)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('One-way Service')
  const displayText = page.getByLabel('Teks untuk layar')
  await expect(displayText).toBeVisible()
  await displayText.fill('terima kasih')
  await expect(page.getByText('Gerakan kata')).toBeVisible({ timeout: 15_000 })
  await displayText.fill('ab')
  const signStep = page.getByTestId('sign-step-label')
  await expect(signStep).toHaveText('A')
  expect(Number(await signStep.getAttribute('data-start-offset-ms'))).toBeGreaterThan(0)
  await page.waitForTimeout(1_500)
  await expect(signStep).toHaveText('A')
  await expect(signStep).toHaveText('B', { timeout: 6_000 })
  await displayText.fill('xyz')
  await expect(page.getByText('Ejaan huruf', { exact: true })).toBeVisible()
  await expect(page.getByText('Clip alfabet belum tersedia; huruf tetap ditampilkan berurutan.')).toBeVisible({ timeout: 7_000 })
  await page.goto(`${baseUrl}/ritz`)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Ritz')
  await expect(page.getByRole('heading', { name: 'Layanan psikolog BISARA.' })).toBeVisible()
  await page.goto(`${baseUrl}/two-way/resepsionis`)
  await expect(page.getByRole('heading', { name: 'Layanan Resepsionis' })).toBeVisible()
})

test('mobile navigation keeps feature hierarchy accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(baseUrl)
  await page.getByRole('button', { name: 'Buka menu' }).click()
  await expect(page.locator('#menu-mobile')).toBeVisible()
  await page.getByRole('button', { name: 'Fitur' }).click()
  const features = page.locator('#menu-mobile-fitur')
  await expect(features.getByRole('link', { name: 'One-way Service' })).toBeVisible()
  await expect(features.getByRole('link', { name: 'Two-way Service' })).toBeVisible()
  await expect(features.getByRole('link', { name: 'Layanan Psikolog' })).toBeVisible()
  await page.getByRole('button', { name: 'Tutup menu' }).click()
  await expect(page.locator('#menu-mobile')).toBeHidden()
})

test('one-way editor publishes the saved message to its private display', async ({ context, page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  const displayToken = 'private-display-token'
  const editorToken = 'private-editor-token'
  const expiresAt = '2099-01-01T00:00:00.000Z'
  let savedText = ''
  let saveAttempts = 0

  await context.route('**/api/catalog/phrases', async (route) => {
    await route.fulfill({ json: { success: true, data: [] } })
  })
  await context.route('**/api/displays', async (route) => {
    await route.fulfill({
      json: { success: true, data: { token: displayToken, editorToken, text: '', expiresAt, phrase: null } },
    })
  })
  await context.route(`**/api/displays/${displayToken}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      saveAttempts += 1
      if (saveAttempts === 1) {
        await route.abort('failed')
        return
      }
      const payload: { text: string } = route.request().postDataJSON()
      savedText = payload.text
    }
    await route.fulfill({
      json: { success: true, data: { token: displayToken, text: savedText, expiresAt, phrase: null } },
    })
  })

  await page.goto(`${baseUrl}/one-way`)
  const editor = page.getByLabel('Teks untuk layar')
  const publishButton = page.getByRole('button', { name: 'Tampilkan ke layar' })
  await editor.fill('Informasi layanan dibuka pukul delapan.')
  const speedControls = page.getByRole('group', { name: 'Kecepatan animasi' })
  await expect(speedControls).toBeVisible()
  await speedControls.getByRole('button', { name: 'Kecepatan 1.5x' }).click()
  await expect(speedControls.getByRole('button', { name: 'Kecepatan 1.5x' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Jeda animasi' }).click()
  await expect(page.getByRole('button', { name: 'Putar animasi' })).toBeVisible()
  const pausedStep = await page.getByTestId('sign-step-label').textContent()
  await page.waitForTimeout(1_200)
  await expect(page.getByTestId('sign-step-label')).toHaveText(pausedStep ?? '')
  const stopButton = page.getByRole('button', { name: 'Hentikan animasi' })
  await stopButton.click()
  await expect(stopButton).toBeDisabled()
  await expect(page.getByTestId('sign-step-label')).toHaveText('I')
  await page.getByRole('button', { name: 'Putar animasi' }).click()
  await expect(page.getByRole('button', { name: 'Jeda animasi' })).toBeVisible()
  await expect(page.getByTestId('sign-step-label')).not.toHaveText('I', { timeout: 6_000 })
  await expect(page.getByText('WebGL 3D · BISINDO')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await expect(page.getByText('Link layar privat:')).toHaveCount(0)
  await publishButton.evaluate((element) => element.scrollIntoView({ block: 'center' }))
  await publishButton.click()
  await expect(page.getByRole('alert')).toContainText('Tidak dapat terhubung ke server BISARA')
  await page.getByRole('button', { name: 'Coba simpan lagi' }).click()

  const displayLink = page.getByRole('link', { name: new RegExp(`/display/${displayToken}$`) })
  await expect(displayLink).toBeVisible()
  const popupPromise = context.waitForEvent('page')
  await displayLink.click()
  const displayPage = await popupPromise
  await expect(displayPage.getByRole('heading', { name: savedText })).toBeVisible()
  await expect(displayPage.getByText('Memuat pesan…')).toHaveCount(0)

  await editor.fill('Pesan yang belum disimpan')
  await expect(displayLink).toHaveCount(0)
})

test('ADMIN can wait safely and pair with the next USER in a Ritz room', async ({ browser }) => {
  test.setTimeout(90_000)
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
    await expect(adminPage).toHaveURL(`${baseUrl}/two-way`)
    await adminPage.goto(`${baseUrl}/ritz`)
    await adminPage.getByRole('button', { name: 'Masuk layanan psikolog' }).click()
    await expect(adminPage.getByText('Mencari pendamping Ritz…')).toBeVisible()
    await expect(adminPage.getByRole('alert')).toHaveCount(0)

    await userPage.goto(`${baseUrl}/register`)
    await userPage.getByLabel('Nama lengkap').fill('Smoke User')
    await userPage.getByLabel('Email').fill(memberEmail)
    await userPage.locator('input[type="password"]').fill('SmokePassword123!')
    await userPage.getByRole('button', { name: 'Daftar' }).click()
    await expect(userPage).toHaveURL(`${baseUrl}/two-way`)
    await userPage.goto(`${baseUrl}/ritz`)
    await userPage.getByRole('button', { name: 'Masuk layanan psikolog' }).click()
    await expect(userPage.getByText('Menunggu pendamping Ritz.').or(userPage.getByText('Pembukaan konsultasi'))).toBeVisible()
    await expect(adminPage.getByLabel('Catatan psikolog')).toBeVisible({ timeout: 15_000 })
    await adminPage.getByLabel('Catatan psikolog').fill('Catatan smoke lokal')
    await expect(adminPage.getByRole('button', { name: 'Rekam suara' })).toBeVisible()
    await expect(userPage.getByRole('button', { name: 'Rekam' })).toBeVisible({ timeout: 15_000 })
    await expect(userPage.getByRole('button', { name: 'Kecepatan 0.75x' })).toBeVisible()
    await expect(userPage.getByRole('button', { name: 'Kecepatan 1.25x' })).toBeVisible()
    await expect(userPage.getByRole('button', { name: 'Kecepatan 1.5x' })).toBeVisible()
    await expect(userPage.getByText('Chat sementara aktif')).toBeVisible({ timeout: 15_000 })
    await expect(adminPage.getByText('Chat sementara aktif')).toBeVisible({ timeout: 15_000 })
    await userPage.getByRole('button', { name: 'Bersedia, mulai' }).click()
    await expect(userPage.getByText('Rekam jawaban PSS-10')).toBeVisible({ timeout: 15_000 })
    await expect(userPage.getByText('Pilih jawaban Anda')).toHaveCount(0)
    await expect(userPage.locator('video')).toHaveCount(2)
    await expect(userPage.getByText('Live Video')).toBeVisible({ timeout: 20_000 })
    await expect(adminPage.getByText('Live Video')).toBeVisible({ timeout: 20_000 })
    await adminPage.getByLabel('Pesan chat').fill('terima kasih')
    await adminPage.getByRole('button', { name: 'Kirim' }).click()
    await expect(userPage.getByText('Gerakan kata', { exact: true })).toBeVisible({ timeout: 15_000 })
    await expect(adminPage.getByText('Gerakan kata', { exact: true })).toBeVisible({ timeout: 15_000 })
    await userPage.getByLabel('Pesan chat').fill('Pesan smoke sementara')
    await userPage.getByRole('button', { name: 'Kirim' }).click()
    await expect(adminPage.getByText('Smoke User: Pesan smoke sementara')).toBeVisible({ timeout: 15_000 })
    await adminPage.getByRole('button', { name: 'Bacakan pesan' }).last().click()
    await adminPage.waitForTimeout(3_000)
    await expect(adminPage.getByRole('alert')).toHaveCount(0)
    await userPage.route('**/api/ai/rooms/*/predict', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            prediction: 'tidak pernah',
            confidence: 0.98,
            alternatives: [],
            quality: { frames: 120, shoulder_rate: 0.95, hand_rate: 0.96 },
          },
        }),
      })
    })
    await userPage.getByRole('button', { name: 'Rekam', exact: true }).click()
    await expect(userPage.getByLabel('Koreksi hasil isyarat')).toBeVisible({ timeout: 12_000 })
    await userPage.getByLabel('Koreksi hasil isyarat').fill('Tidak pernah')
    await userPage.getByRole('button', { name: 'Kirim jawaban PSS-10' }).click()
    await expect(adminPage.getByText('Pertanyaan 2 / 10')).toBeVisible({ timeout: 15_000 })
    expect(await adminPage.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true)
    expect(await userPage.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true)
    await userPage.getByRole('button', { name: 'Akhiri layanan' }).click()
    await expect(userPage).toHaveURL(`${baseUrl}/ritz`)
  } finally {
    await Promise.allSettled([user.close(), admin.close()])
  }
})
