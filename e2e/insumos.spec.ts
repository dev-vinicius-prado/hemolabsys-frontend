import { test, expect } from '@playwright/test';
import { login } from './auth-helper';

test.describe('Cadastro de Insumos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/insumos');
  });

  test('deve cadastrar um novo insumo com sucesso', async ({ page }) => {
    // Clica no botão "Novo Insumo"
    await page.click('button:has-text("Novo Insumo")');

    // Preenche o formulário
    const codigoInsumo = 'INS-' + Date.now();
    const descInsumo = 'Insumo Teste E2E';
    
    await page.fill('input >> nth=1', codigoInsumo); // Código
    await page.fill('input >> nth=2', descInsumo);  // Descrição
    
    await page.selectOption('select >> nth=0', 'OUTROS'); // Categoria
    
    // Seleciona o primeiro fornecedor e unidade de medida se houver
    const fornecedorSelect = page.locator('select >> nth=1');
    if (await fornecedorSelect.locator('option').count() > 1) {
        await fornecedorSelect.selectOption({ index: 1 });
    }

    const unidadeSelect = page.locator('select >> nth=2');
    if (await unidadeSelect.locator('option').count() > 1) {
        await unidadeSelect.selectOption({ index: 1 });
    }

    // Clica em Salvar
    await page.click('button:has-text("Salvar")');

    // Verifica se aparece na listagem
    await expect(page.locator('table')).toContainText(codigoInsumo);
    await expect(page.locator('table')).toContainText(descInsumo);
  });

  test('deve filtrar insumos na listagem', async ({ page }) => {
    const searchTerm = 'INS';
    await page.fill('input[placeholder="Buscar por código, descrição, marca..."]', searchTerm);
    
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
        await expect(rows.first()).toContainText(searchTerm);
    }
  });
});
