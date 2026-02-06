export {};

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Espera a aplicação carregar completamente
			 */
			waitForApp(): Chainable<void>;

			/**
			 * Realiza uma busca usando o campo de pesquisa
			 */
			search(term: string): Chainable<void>;

			/**
			 * Limpa o campo de busca
			 */
			clearSearch(): Chainable<void>;

			/**
			 * Abre o formulário de criação (clica em "Novo...")
			 */
			openCreateForm(): Chainable<void>;

			/**
			 * Fecha o painel lateral (split-view)
			 */
			closePanel(): Chainable<void>;

			/**
			 * Confirma exclusão no dialog
			 */
			confirmDelete(): Chainable<void>;

			/**
			 * Cancela exclusão no dialog
			 */
			cancelDelete(): Chainable<void>;
		}
	}
}

// Espera a aplicação carregar
Cypress.Commands.add("waitForApp", () => {
	cy.get('[data-slot="skeleton"]', { timeout: 10000 }).should("not.exist");
});

// Busca usando o campo de pesquisa
Cypress.Commands.add("search", (term: string) => {
	cy.get('input[type="search"]').clear().type(term);
	// Aguarda debounce
	cy.wait(400);
});

// Limpa o campo de busca
Cypress.Commands.add("clearSearch", () => {
	cy.get('input[type="search"]').clear();
	cy.wait(400);
});

// Abre formulário de criação
Cypress.Commands.add("openCreateForm", () => {
	cy.contains("button", /^Nov[oa]/).click();
});

// Fecha o painel lateral
Cypress.Commands.add("closePanel", () => {
	cy.get('[data-slot="split-view-panel"]').within(() => {
		cy.get("button").first().click();
	});
});

// Confirma exclusão
Cypress.Commands.add("confirmDelete", () => {
	cy.get('[role="alertdialog"]').within(() => {
		cy.contains("button", "Excluir").click();
	});
});

// Cancela exclusão
Cypress.Commands.add("cancelDelete", () => {
	cy.get('[role="alertdialog"]').within(() => {
		cy.contains("button", "Cancelar").click();
	});
});  