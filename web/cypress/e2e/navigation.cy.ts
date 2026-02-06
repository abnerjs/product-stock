describe("Navegação", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("deve carregar o Dashboard como página inicial", () => {
		cy.url().should("eq", Cypress.config().baseUrl + "/");
		cy.contains("h1", "Dashboard").should("be.visible");
	});

	it("deve navegar para Matérias-Primas", () => {
		cy.contains("a", "Matérias-Primas").click();
		cy.url().should("include", "/raw");
		cy.contains("h1", "Matérias-Primas").should("be.visible");
	});

	it("deve navegar para Produtos", () => {
		cy.contains("a", "Produtos").click();
		cy.url().should("include", "/product");
		cy.contains("h1", "Produtos").should("be.visible");
	});

	it("deve navegar de volta ao Dashboard", () => {
		cy.contains("a", "Produtos").click();
		cy.url().should("include", "/product");

		cy.contains("a", "Dashboard").click();
		cy.url().should("eq", Cypress.config().baseUrl + "/");
		cy.contains("h1", "Dashboard").should("be.visible");
	});

	it("deve mostrar o menu de navegação ativo corretamente", () => {
		// Dashboard ativo por padrão
		cy.get("nav").within(() => {
			cy.contains("a", "Dashboard").should(
				"have.attr",
				"data-active",
				"true"
			);
		});

		// Navegar para Matérias-Primas
		cy.contains("a", "Matérias-Primas").click();
		cy.get("nav").within(() => {
			cy.contains("a", "Matérias-Primas").should(
				"have.attr",
				"data-active",
				"true"
			);
			cy.contains("a", "Dashboard").should(
				"have.attr",
				"data-active",
				"false"
			);
		});
	});

	it("deve ter o título da aplicação no header", () => {
		cy.get("header").within(() => {
			cy.contains("Controle de Estoque").should("be.visible");
		});
	});
});
