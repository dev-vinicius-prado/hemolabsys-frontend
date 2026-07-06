import { test, expect } from '@playwright/test';

test.describe('Página Inicial', () => {
  test('deve carregar a página inicial e verificar o título', async ({ page }) => {
    // Navega para a URL base configurada no playwright.config.ts
    await page.goto('/');

    // Verifica se o título da página contém 'Fuse' (baseado no template)
    // Você pode ajustar isso para o título real do HemoLabSys
    await expect(page).toHaveTitle(/Fuse/);
  });

  test('deve navegar para a página de login se não autenticado', async ({ page }) => {
    await page.goto('/dashboard');
    
    // O template Fuse geralmente redireciona para /sign-in se não logado
    await expect(page).toHaveURL(/.*sign-in/);
  });
});
