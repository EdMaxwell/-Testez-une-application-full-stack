describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should register successfully', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {}
    }).as('registerRequest');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john.doe@example.com');
    cy.get('input[formControlName=password]').type('SecurePass1!');
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest').its('request.body').should('deep.include', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass1!'
    });

    cy.location('pathname').should('eq', '/login');
  });

  it('should show an error when register fails', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { error: 'Email already used' }
    }).as('registerFail');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('existing@example.com');
    cy.get('input[formControlName=password]').type('SecurePass1!');
    cy.get('button[type=submit]').click();

    cy.wait('@registerFail').its('response.statusCode').should('eq', 400);
    cy.get('.error').should('be.visible');
    cy.location('pathname').should('eq', '/register');
  });

  it('should disable submit button with empty fields', () => {
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should disable submit button when only some fields are filled', () => {
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should disable submit button with missing email', () => {
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=password]').type('SecurePass1!');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should enable submit button when all fields are filled', () => {
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john@example.com');
    cy.get('input[formControlName=password]').type('password123');
    cy.get('button[type=submit]').should('not.be.disabled');
  });
});
