describe('Página Inicial', () => {
    it('deve carregar corretamente', () => {
        cy.visit('/');
        cy.contains('Bem-vindo à Página Inicial');
    });

    it('deve ter um botão de login', () => {
        cy.get('button').contains('Login').should('be.visible');
    });
});