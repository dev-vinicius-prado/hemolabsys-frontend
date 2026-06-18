import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/sign-in');
  
  // Usando as credenciais fornecidas pelo Vinicius
  await page.fill('input[type="email"], input[name="email"]', 'admin@hemolabsys.com.br');
  await page.fill('input[type="password"], input[name="password"]', 'senha123');
  
  await page.click('button[type="submit"]');
  
  // Aguarda o redirecionamento para o dashboard
  await expect(page).toHaveURL(/.*dashboard/);
}
