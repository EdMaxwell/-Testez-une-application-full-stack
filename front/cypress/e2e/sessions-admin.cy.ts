describe('Sessions - Admin parcours', () => {
  const loginAsAdmin = () => {
    cy.intercept('POST', '/api/auth/login', { fixture: 'login-success.json' }).as('loginAdmin');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessions');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@loginAdmin').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
    cy.wait('@getSessions').its('response.statusCode').should('eq', 200);
  };

  const openFirstSessionDetail = () => {
    cy.intercept('GET', '/api/session/1', { fixture: 'session-detail.json' }).as('getSessionDetail');
    cy.intercept('GET', '/api/teacher/1', { fixture: 'teacher.json' }).as('getTeacher');

    cy.get('mat-card.item').first().contains('button', 'Detail').click();

    cy.wait('@getSessionDetail').its('response.statusCode').should('eq', 200);
    cy.wait('@getTeacher').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions/detail/1');
  };

  beforeEach(() => {
    loginAsAdmin();
  });

  it('should display create button for admin on sessions list', () => {
    cy.contains('button', 'Create').should('be.visible');
  });

  it('should display edit button for admin on sessions list', () => {
    cy.get('mat-card.item').first().contains('button', 'Edit').should('be.visible');
  });

  it('should display delete button on session detail for admin', () => {
    openFirstSessionDetail();

    cy.contains('button', 'Delete').should('be.visible');
    cy.contains('button', 'Participate').should('not.exist');
  });

  it('should allow admin to create a session', () => {
    cy.intercept('GET', '/api/teacher', { fixture: 'teachers.json' }).as('getTeachers');
    cy.intercept('POST', '/api/session', { fixture: 'session-created.json' }).as('createSession');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessionsAfterCreate');

    cy.contains('button', 'Create').click();
    cy.location('pathname').should('eq', '/sessions/create');
    cy.wait('@getTeachers').its('response.statusCode').should('eq', 200);

    cy.get('input[formControlName=name]').type('New Session');
    cy.get('input[formControlName=date]').type('2024-07-01');
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.get('mat-option').first().click();
    cy.get('textarea[formControlName=description]').type('A brand new yoga session');

    cy.contains('button', 'Save').should('not.be.disabled').click();

    cy.wait('@createSession').its('request.body').should('deep.include', {
      name: 'New Session',
      description: 'A brand new yoga session'
    });

    cy.wait('@getSessionsAfterCreate').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
  });

  it('should disable save button when required fields are empty on create form', () => {
    cy.intercept('GET', '/api/teacher', { fixture: 'teachers.json' }).as('getTeachers');

    cy.contains('button', 'Create').click();
    cy.location('pathname').should('eq', '/sessions/create');
    cy.wait('@getTeachers').its('response.statusCode').should('eq', 200);

    cy.contains('button', 'Save').should('be.disabled');
  });

  it('should allow admin to edit a session', () => {
    cy.intercept('GET', '/api/session/1', { fixture: 'session-detail.json' }).as('getSessionDetail');
    cy.intercept('GET', '/api/teacher', { fixture: 'teachers.json' }).as('getTeachers');
    cy.intercept('PUT', '/api/session/1', { fixture: 'session-updated.json' }).as('updateSession');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessionsAfterUpdate');

    cy.get('mat-card.item').first().contains('button', 'Edit').click();

    cy.location('pathname').should('eq', '/sessions/update/1');
    cy.wait('@getSessionDetail').its('response.statusCode').should('eq', 200);
    cy.wait('@getTeachers').its('response.statusCode').should('eq', 200);

    cy.get('input[formControlName=name]').clear().type('Updated Morning Yoga');
    cy.contains('button', 'Save').should('not.be.disabled').click();

    cy.wait('@updateSession').its('request.body').should('deep.include', {
      name: 'Updated Morning Yoga'
    });

    cy.wait('@getSessionsAfterUpdate').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
  });

  it('should allow admin to delete a session', () => {
    openFirstSessionDetail();

    cy.intercept('DELETE', '/api/session/1', {
      statusCode: 200,
      body: {}
    }).as('deleteSession');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessionsAfterDelete');

    cy.contains('button', 'Delete').click();

    cy.wait('@deleteSession').its('response.statusCode').should('eq', 200);
    cy.wait('@getSessionsAfterDelete').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
  });
});
