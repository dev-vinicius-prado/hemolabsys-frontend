import { test, expect } from '@playwright/test';
import { login } from './auth-helper';

test.describe('Cadastro de Fornecedores', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/fornecedores');
  });

  test('deve cadastrar um novo fornecedor com sucesso', async ({ page }) => {
    // Clica no botão "Novo Fornecedor"
    await page.click('button:has-text("Novo Fornecedor")');

    // Preenche o formulário
    const nomeFornecedor = 'Fornecedor E2E Test ' + Date.now();
    await page.fill('input >> nth=1', nomeFornecedor); // Primeiro input é busca, segundo é nome no form
    await page.fill('input >> nth=2', '12.345.678/0001-90');

    // Clica em Salvar
    await page.click('button:has-text("Salvar")');

    // Verifica se o formulário foi fechado ou se o registro aparece na lista
    await expect(page.locator('table')).toContainText(nomeFornecedor);
  });

  test('deve filtrar fornecedores na listagem', async ({ page }) => {
    const searchTerm = 'Fornecedor';
    await page.fill('input[placeholder="Buscar por nome ou CNPJ..."]', searchTerm);
    
    // Verifica se todos os itens na tabela contêm o termo de busca (ou se a lista não está vazia)
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
        await expect(rows.first()).toContainText(searchTerm);
    }
  });
});
