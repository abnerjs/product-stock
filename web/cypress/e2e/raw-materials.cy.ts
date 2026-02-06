describe("Matérias-Primas", () => {
	beforeEach(() => {
		cy.visit("/raw");
		cy.waitForApp();
	});

	describe("Listagem", () => {
		it("deve exibir o título da página", () => {
			cy.contains("h1", "Matérias-Primas").should("be.visible");
		});

		it("deve exibir a tabela de matérias-primas", () => {
			cy.get("table").should("exist");
			cy.contains("th", "Nome").should("be.visible");
			cy.contains("th", "Quantidade").should("be.visible");
		});

		it("deve exibir o botão de nova matéria-prima", () => {
			cy.contains("button", "Nova Matéria-Prima").should("be.visible");
		});

		it("deve exibir o campo de busca", () => {
			cy.get('input[type="search"]').should("be.visible");
		});
	});

	describe("Busca", () => {
		it("deve filtrar matérias-primas pelo nome", () => {
			cy.get("table tbody tr")
				.first()
				.find("td")
				.first()
				.invoke("text")
				.then((name) => {
					const searchTerm = name.trim().slice(0, 3);

					cy.search(searchTerm);
					cy.waitForApp();

					cy.get("table tbody tr")
						.first()
						.should("contain.text", searchTerm);
				});
		});

		it("deve mostrar mensagem quando não encontrar resultados", () => {
			cy.search("xyznonexistent123456");
			cy.waitForApp();

			cy.contains("Nenhuma matéria-prima encontrada").should("be.visible");
		});
	});

	describe("Paginação", () => {
		it("deve exibir controles de paginação", () => {
			cy.get('[data-slot="pagination"]').should("exist");
		});

		it("deve navegar entre páginas", () => {
			cy.get('[data-slot="pagination"]').within(() => {
				cy.get("button").last().click();
			});

			cy.waitForApp();
			cy.url().should("include", "page=2");
		});
	});

	describe("Criação", () => {
		const uniqueName = `Test Material ${Date.now()}`;

		it("deve abrir o formulário de criação", () => {
			cy.contains("button", "Nova Matéria-Prima").click();

			cy.get('[data-slot="split-view-panel"]').should("be.visible");
			cy.contains("Nova Matéria-Prima").should("be.visible");
		});

		it("deve criar uma nova matéria-prima", () => {
			cy.contains("button", "Nova Matéria-Prima").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="name"]').type(uniqueName);
				cy.get('input[name="quantity"]').clear().type("100");

				cy.contains("button", "Salvar").click();
			});

			// Verifica toast de sucesso ou que o item aparece na lista
			cy.waitForApp();
			cy.search(uniqueName);
			cy.waitForApp();

			cy.get("table tbody").should("contain.text", uniqueName);
		});

		it("deve validar campos obrigatórios", () => {
			cy.contains("button", "Nova Matéria-Prima").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				// Tenta salvar sem preencher
				cy.contains("button", "Salvar").click();

				// Verifica que há mensagens de erro
				cy.contains("Nome é obrigatório").should("be.visible");
			});
		});

		it("deve fechar o painel ao cancelar", () => {
			cy.contains("button", "Nova Matéria-Prima").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get("button").first().click(); // Botão de fechar
			});

			cy.get('[data-slot="split-view-panel"]').should("not.exist");
		});
	});

	describe("Edição", () => {
		it("deve abrir o formulário de edição ao clicar no item", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').should("be.visible");
			cy.contains("Editar Matéria-Prima").should("be.visible");
		});

		it("deve carregar os dados existentes no formulário", () => {
			// Pega os dados da primeira linha
			cy.get("table tbody tr")
				.first()
				.find("td")
				.first()
				.invoke("text")
				.then((name) => {
					cy.get("table tbody tr").first().click();

					cy.get('[data-slot="split-view-panel"]').within(() => {
						cy.get('input[name="name"]').should(
							"have.value",
							name.trim()
						);
					});
				});
		});

		it("deve atualizar uma matéria-prima", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="quantity"]').clear().type("999");
				cy.contains("button", "Salvar").click();
			});

			cy.waitForApp();

			// Verifica que a quantidade foi atualizada
			cy.get("table tbody tr").first().should("contain.text", "999");
		});
	});

	describe("Exclusão", () => {
		it("deve abrir o dialog de confirmação", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.contains("button", "Excluir").click();
			});

			cy.get('[role="alertdialog"]').should("be.visible");
			cy.contains("Tem certeza").should("be.visible");
		});

		it("deve cancelar a exclusão", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.contains("button", "Excluir").click();
			});

			cy.cancelDelete();

			// O painel ainda deve estar aberto
			cy.get('[data-slot="split-view-panel"]').should("be.visible");
		});

		it("deve excluir uma matéria-prima", () => {
			// Primeiro cria uma para excluir
			const nameToDelete = `Delete Test ${Date.now()}`;

			cy.contains("button", "Nova Matéria-Prima").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="name"]').type(nameToDelete);
				cy.get('input[name="quantity"]').clear().type("1");
				cy.contains("button", "Salvar").click();
			});

			cy.waitForApp();

			// Busca e exclui
			cy.search(nameToDelete);
			cy.waitForApp();

			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.contains("button", "Excluir").click();
			});

			cy.confirmDelete();
			cy.waitForApp();

			// Verifica que não existe mais
			cy.get("table tbody").should("not.contain.text", nameToDelete);
		});
	});
});
