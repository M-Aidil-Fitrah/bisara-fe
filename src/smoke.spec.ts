import { test, expect } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:5173'

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
