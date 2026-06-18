import { test, expect } from '@playwright/test';
import { login } from './auth-helper';

test.describe('Cadastro de Almoxarifados', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/almoxarifado');
  });

  test('deve cadastrar um novo almoxarifado com sucesso', async ({ page }) => {
    // Clica no botão "Novo Almoxarifado"
    await page.click('button:has-text("Novo Almoxarifado")');

    // Preenche o formulário
    const codigoAlmox = 'ALMOX-' + Date.now();
    const descAlmox = 'Almoxarifado Teste E2E';
    
    await page.fill('input >> nth=1', codigoAlmox); // Código
    await page.fill('input >> nth=2', descAlmox);  // Descrição
    await page.selectOption('select', 'ALMOXARIFADO'); // Tipo

    // Clica em Salvar
    await page.click('button:has-text("Salvar")');

    // Verifica se aparece na listagem
    await expect(page.locator('table')).toContainText(codigoAlmox);
    await expect(page.locator('table')).toContainText(descAlmox);
  });

  test('deve filtrar almoxarifados na listagem', async ({ page }) => {
    const searchTerm = 'ALMOX';
    await page.fill('input[placeholder="Buscar por código, descrição ou tipo..."]', searchTerm);
    
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
        await expect(rows.first()).toContainText(searchTerm);
    }
  });
});
