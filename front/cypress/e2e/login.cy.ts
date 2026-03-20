describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should log in successfully as admin', () => {
    cy.intercept('POST', '/api/auth/login', { fixture: 'login-success.json' }).as('loginRequest');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessions');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@loginRequest').its('request.body').should('deep.include', {
      email: 'yoga@studio.com',
      password: 'test!1234'
    });

    cy.wait('@getSessions').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
  });

  it('should show an error message with bad credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('loginFail');

    cy.get('input[formControlName=email]').type('wrong@email.com');
    cy.get('input[formControlName=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();

    cy.wait('@loginFail').its('response.statusCode').should('eq', 401);
    cy.get('.error').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('should disable submit button with empty fields', () => {
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should disable submit button with email only', () => {
    cy.get('input[formControlName=email]').type('test@test.com');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should disable submit button with password only', () => {
    cy.get('input[formControlName=password]').type('password123');
    cy.get('button[type=submit]').should('be.disabled');
  });
});
