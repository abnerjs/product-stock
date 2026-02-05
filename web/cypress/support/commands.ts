export {};  
declare global {  
  namespace Cypress {  
    interface Chainable {  
      login(username: string, password: string): Chainable<Element>;  
    }  
  }  
}  

Cypress.Commands.add('login', (username, password) => {  
  cy.visit('/login');  
  cy.get('input[name=username]').type(username);  
  cy.get('input[name=password]').type(password);  
  cy.get('button[type=submit]').click();  
});  