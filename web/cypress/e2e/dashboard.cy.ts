describe("Dashboard", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.waitForApp();
	});

	describe("Carregamento inicial", () => {
		it("deve exibir o título do Dashboard", () => {
			cy.contains("h1", "Dashboard").should("be.visible");
		});

		it("deve carregar a lista de produtos", () => {
			cy.get('[data-slot="card"]').should("have.length.at.least", 1);
		});

		it("deve exibir o campo de busca", () => {
			cy.get('input[type="search"]').should("be.visible");
		});

		it("deve exibir o filtro de produzibilidade", () => {
			cy.contains("button", "Todos").should("be.visible");
		});
	});

	describe("Filtro de produzibilidade", () => {
		it("deve filtrar por produtos produzíveis", () => {
			cy.contains("button", "Produzíveis").click();

			cy.waitForApp();

			// Verifica que os cards exibidos têm badge verde (se houver resultados)
			cy.get("body").then(($body) => {
				if ($body.find('[data-slot="card"]').length > 0) {
					cy.get('[data-slot="badge"]')
						.first()
						.should("have.class", "bg-emerald-500/15");
				}
			});
		});

		it("deve filtrar por produtos não produzíveis", () => {
			cy.contains("button", "Não Produzíveis").click();

			cy.waitForApp();

			// Verifica que os cards exibidos têm badge vermelho (se houver resultados)
			cy.get("body").then(($body) => {
				if ($body.find('[data-slot="card"]').length > 0) {
					cy.get('[data-slot="badge"]')
						.first()
						.should("have.class", "bg-red-500/15");
				}
			});
		});

		it("deve voltar para mostrar todos os produtos", () => {
			cy.contains("button", "Produzíveis").click();
			cy.waitForApp();

			cy.contains("button", "Todos").click();
			cy.waitForApp();

			cy.get('[data-slot="card"]').should("have.length.at.least", 1);
		});
	});

	describe("Busca", () => {
		it("deve filtrar produtos pelo nome", () => {
			// Pega o nome do primeiro produto para buscar
			cy.get('[data-slot="card"]')
				.first()
				.find("h3")
				.invoke("text")
				.then((productName) => {
					const searchTerm = productName.slice(0, 3);

					cy.search(searchTerm);
					cy.waitForApp();

					// Verifica que os resultados contêm o termo buscado
					cy.get('[data-slot="card"]')
						.first()
						.find("h3")
						.should("contain.text", searchTerm);
				});
		});

		it("deve mostrar mensagem quando não encontrar resultados", () => {
			cy.search("xyznonexistent123456");
			cy.waitForApp();

			cy.contains("Nenhum produto encontrado").should("be.visible");
		});

		it("deve limpar a busca e mostrar todos os produtos", () => {
			cy.search("xyznonexistent123456");
			cy.waitForApp();

			cy.clearSearch();
			cy.waitForApp();

			cy.get('[data-slot="card"]').should("have.length.at.least", 1);
		});
	});

	describe("Expansão dos cards", () => {
		it("deve expandir o card ao clicar", () => {
			cy.get('[data-slot="card"]').first().click();

			// Verifica que o conteúdo expandido está visível
			cy.get('[data-slot="card"]')
				.first()
				.within(() => {
					cy.contains("Matérias-Primas").should("be.visible");
				});
		});

		it("deve colapsar o card ao clicar novamente", () => {
			const card = cy.get('[data-slot="card"]').first();

			// Expande
			card.click();
			cy.contains("Matérias-Primas").should("be.visible");

			// Colapsa
			cy.get('[data-slot="card"]').first().find("button").first().click();
		});

		it("deve exibir tabela de matérias-primas no card expandido", () => {
			cy.get('[data-slot="card"]').first().click();

			cy.get('[data-slot="card"]')
				.first()
				.within(() => {
					cy.get("table").should("exist");
					cy.contains("th", "Matéria-Prima").should("be.visible");
					cy.contains("th", "Necessário").should("be.visible");
					cy.contains("th", "Em Estoque").should("be.visible");
				});
		});
	});

	describe("Paginação", () => {
		it("deve exibir controles de paginação", () => {
			cy.get('[data-slot="pagination"]').should("exist");
		});

		it("deve navegar para a próxima página", () => {
			cy.get('[data-slot="pagination"]').within(() => {
				cy.get("button").last().click();
			});

			cy.waitForApp();
			cy.url().should("include", "page=2");
		});

		it("deve navegar para a página anterior", () => {
			// Vai para página 2
			cy.get('[data-slot="pagination"]').within(() => {
				cy.get("button").last().click();
			});
			cy.waitForApp();

			// Volta para página 1
			cy.get('[data-slot="pagination"]').within(() => {
				cy.get("button").first().click();
			});
			cy.waitForApp();

			cy.url().should("not.include", "page=2");
		});
	});

	describe("Informações do card", () => {
		it("deve exibir nome do produto", () => {
			cy.get('[data-slot="card"]').first().find("h3").should("not.be.empty");
		});

		it("deve exibir badge de produzibilidade", () => {
			cy.get('[data-slot="card"]')
				.first()
				.find('[data-slot="badge"]')
				.should("exist");
		});

		it("deve exibir quantidade produzível", () => {
			cy.get('[data-slot="card"]')
				.first()
				.contains(/Pode produzir|Não é possível/)
				.should("be.visible");
		});

		it("deve exibir preço do produto", () => {
			cy.get('[data-slot="card"]')
				.first()
				.contains(/R\$/)
				.should("be.visible");
		});
	});
});
