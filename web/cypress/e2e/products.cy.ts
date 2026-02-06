describe("Produtos", () => {
	beforeEach(() => {
		cy.visit("/product");
		cy.waitForApp();
	});

	describe("Listagem", () => {
		it("deve exibir o título da página", () => {
			cy.contains("h1", "Produtos").should("be.visible");
		});

		it("deve exibir a tabela de produtos", () => {
			cy.get("table").should("exist");
			cy.contains("th", "Nome").should("be.visible");
			cy.contains("th", "Preço").should("be.visible");
		});

		it("deve exibir o botão de novo produto", () => {
			cy.contains("button", "Novo Produto").should("be.visible");
		});

		it("deve exibir o campo de busca", () => {
			cy.get('input[type="search"]').should("be.visible");
		});
	});

	describe("Busca", () => {
		it("deve filtrar produtos pelo nome", () => {
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

			cy.contains("Nenhum produto encontrado").should("be.visible");
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
		const uniqueName = `Test Product ${Date.now()}`;

		it("deve abrir o formulário de criação", () => {
			cy.contains("button", "Novo Produto").click();

			cy.get('[data-slot="split-view-panel"]').should("be.visible");
			cy.contains("Novo Produto").should("be.visible");
		});

		it("deve criar um produto sem matérias-primas", () => {
			cy.contains("button", "Novo Produto").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="name"]').type(uniqueName);
				cy.get('input[name="price"]').clear().type("99.99");

				cy.contains("button", "Salvar").click();
			});

			cy.waitForApp();
			cy.search(uniqueName);
			cy.waitForApp();

			cy.get("table tbody").should("contain.text", uniqueName);
		});

		it("deve criar um produto com matérias-primas", () => {
			const productName = `Product with Materials ${Date.now()}`;

			cy.contains("button", "Novo Produto").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="name"]').type(productName);
				cy.get('input[name="price"]').clear().type("150.00");

				// Adiciona matéria-prima
				cy.contains("button", "Adicionar Matéria-Prima").click();
			});

			// Seleciona a primeira matéria-prima no combobox
			cy.get('[role="dialog"], [data-slot="popover"]')
				.last()
				.within(() => {
					cy.get('[role="option"]').first().click();
				});

			cy.get('[data-slot="split-view-panel"]').within(() => {
				// Define a quantidade necessária
				cy.get('input[name="rawMaterials.0.quantity"]')
					.clear()
					.type("5");

				cy.contains("button", "Salvar").click();
			});

			cy.waitForApp();
			cy.search(productName);
			cy.waitForApp();

			cy.get("table tbody").should("contain.text", productName);
		});

		it("deve validar campos obrigatórios", () => {
			cy.contains("button", "Novo Produto").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.contains("button", "Salvar").click();

				cy.contains("Nome é obrigatório").should("be.visible");
			});
		});

		it("deve fechar o painel ao cancelar", () => {
			cy.contains("button", "Novo Produto").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get("button").first().click();
			});

			cy.get('[data-slot="split-view-panel"]').should("not.exist");
		});
	});

	describe("Edição", () => {
		it("deve abrir o formulário de edição ao clicar no item", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').should("be.visible");
			cy.contains("Editar Produto").should("be.visible");
		});

		it("deve carregar os dados existentes no formulário", () => {
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

		it("deve atualizar um produto", () => {
			const newPrice = "12345.67";

			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="price"]').clear().type(newPrice);
				cy.contains("button", "Salvar").click();
			});

			cy.waitForApp();

			// Verifica que o preço foi atualizado (formatado)
			cy.get("table tbody tr")
				.first()
				.should("contain.text", "12.345,67");
		});

		it("deve adicionar matéria-prima a um produto existente", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.contains("button", "Adicionar Matéria-Prima").click();
			});

			// Seleciona matéria-prima
			cy.get('[role="dialog"], [data-slot="popover"]')
				.last()
				.within(() => {
					cy.get('[role="option"]').first().click();
				});

			cy.get('[data-slot="split-view-panel"]').within(() => {
				// Define quantidade
				cy.get('input[name*="quantity"]').last().clear().type("10");

				cy.contains("button", "Salvar").click();
			});

			cy.waitForApp();
		});

		it("deve remover matéria-prima de um produto", () => {
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				// Se houver matérias-primas, remove a primeira
				cy.get("body").then(($body) => {
					if ($body.find('[data-testid="remove-material"]').length > 0) {
						cy.get('[data-testid="remove-material"]').first().click();
						cy.contains("button", "Salvar").click();
					}
				});
			});
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

			cy.get('[data-slot="split-view-panel"]').should("be.visible");
		});

		it("deve excluir um produto", () => {
			// Cria produto para excluir
			const nameToDelete = `Delete Product ${Date.now()}`;

			cy.contains("button", "Novo Produto").click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				cy.get('input[name="name"]').type(nameToDelete);
				cy.get('input[name="price"]').clear().type("1.00");
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

			cy.get("table tbody").should("not.contain.text", nameToDelete);
		});
	});

	describe("Visualização de matérias-primas", () => {
		it("deve exibir lista de matérias-primas no formulário de edição", () => {
			// Encontra um produto que tenha matérias-primas
			cy.get("table tbody tr").first().click();

			cy.get('[data-slot="split-view-panel"]').within(() => {
				// Verifica se a seção de matérias-primas existe
				cy.contains("Matérias-Primas").should("be.visible");
			});
		});
	});
});
