describe('Account and Logout spec', () => {

  const login = (fixture: string, email: string) => {
    cy.intercept('POST', '/api/auth/login', { fixture }).as('login');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessions');

    cy.visit('/login');

    cy.get('input[formControlName=email]').type(email);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
  };

  const goToAccount = (userId: number, fixture: string) => {
    cy.intercept('GET', `/api/user/${userId}`, { fixture }).as('getUser');

    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/me');
  };

  describe('Admin account', () => {
    beforeEach(() => {
      login('login-success.json', 'yoga@studio.com');
    });

    it('Displays user information on account page', () => {
      goToAccount(1, 'user-admin.json');

      cy.contains('User information').should('be.visible');
      cy.contains('Admin').should('be.visible');
      cy.contains('yoga@studio.com').should('be.visible');
      cy.contains('You are admin').should('be.visible');
    });

    it('Admin user does not see delete account button', () => {
      goToAccount(1, 'user-admin.json');

      cy.contains('Delete my account').should('not.exist');
    });

    it('Logout redirects to home page', () => {
      cy.get('span.link').contains('Logout').click();

      cy.location('pathname').should('eq', '/');
      cy.get('span.link').contains('Login').should('be.visible');
      cy.get('span.link').contains('Register').should('be.visible');
    });

    it('After logout, sessions page is not accessible', () => {
      cy.get('span.link').contains('Logout').click();

      cy.location('pathname').should('eq', '/');

      cy.visit('/sessions');

      // à ajuster selon le vrai comportement du guard
      cy.location('pathname').should('satisfy', (pathname: string) => {
        return pathname === '/' || pathname === '/login';
      });
    });
  });

  describe('Regular user account', () => {
    beforeEach(() => {
      login('login-user-success.json', 'user@studio.com');
    });

    it('Displays regular user information on account page', () => {
      goToAccount(2, 'user.json');

      cy.contains('User information').should('be.visible');
      cy.contains('Regular').should('be.visible');
      cy.contains('user@studio.com').should('be.visible');
    });

    it('Regular user sees delete account button', () => {
      goToAccount(2, 'user.json');

      cy.contains('Delete my account').should('be.visible');
    });

    it('Regular user can delete their account', () => {
      goToAccount(2, 'user.json');

      cy.intercept('DELETE', '/api/user/2', {
        statusCode: 200,
        body: {}
      }).as('deleteUser');

      cy.get('button[color=warn]').click();

      cy.wait('@deleteUser').its('response.statusCode').should('eq', 200);
      cy.location('pathname').should('eq', '/');
    });

    it('Back button works on account page', () => {
      goToAccount(2, 'user.json');

      cy.get('button[mat-icon-button]').click();
      cy.location('pathname').should('eq', '/sessions');
    });
  });
});
