import { test, expect } from '@playwright/test';
import { login } from './auth-helper';

test.describe('Cadastro de Setores', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/setor');
  });

  test('deve cadastrar um novo setor com sucesso', async ({ page }) => {
    // Clica no botão "Novo Setor"
    await page.click('button:has-text("Novo Setor")');

    // Preenche o formulário
    const nomeSetor = 'Setor E2E Test ' + Date.now();
    await page.fill('input[type="text"] >> nth=0', nomeSetor); // Nome
    await page.fill('input[type="number"] >> nth=1', '1'); // EmpresaId
    await page.fill('input[type="text"] >> nth=1', 'Descrição do Setor E2E'); // Descricao

    // Clica em Salvar
    await page.click('button:has-text("Salvar")');

    // Verifica se aparece na listagem (o SetorComponent usa app-pagination e tabela)
    await expect(page.locator('table')).toContainText(nomeSetor);
  });

  test('deve filtrar setores na listagem', async ({ page }) => {
    const searchTerm = 'Setor';
    await page.fill('input[placeholder="Buscar por nome..."]', searchTerm);
    
    // Verifica se a tabela contém resultados filtrados
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
        await expect(rows.first()).toContainText(searchTerm);
    }
  });
});
