describe('Sessions - User parcours', () => {
  const loginAsUser = () => {
    cy.intercept('POST', '/api/auth/login', { fixture: 'login-user-success.json' }).as('loginUser');
    cy.intercept('GET', '/api/session', { fixture: 'sessions-list.json' }).as('getSessions');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@loginUser').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions');
    cy.wait('@getSessions').its('response.statusCode').should('eq', 200);
  };

  const openFirstSessionDetail = (detailFixture: string) => {
    cy.intercept('GET', '/api/session/1', { fixture: detailFixture }).as('getSessionDetail');
    cy.intercept('GET', '/api/teacher/1', { fixture: 'teacher.json' }).as('getTeacher');

    cy.get('mat-card.item').first().contains('button', 'Detail').click();

    cy.wait('@getSessionDetail').its('response.statusCode').should('eq', 200);
    cy.wait('@getTeacher').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('eq', '/sessions/detail/1');
  };

  beforeEach(() => {
    loginAsUser();
  });

  it('should display session list', () => {
    cy.contains('Morning Yoga').should('be.visible');
    cy.contains('Evening Stretch').should('be.visible');
    cy.contains('Rentals available').should('be.visible');
  });

  it('should not display create button for regular user', () => {
    cy.contains('button', 'Create').should('not.exist');
  });

  it('should display detail button for each session', () => {
    cy.get('mat-card.item').first().contains('button', 'Detail').should('be.visible');
  });

  it('should not display edit button for regular user', () => {
    cy.get('mat-card.item').first().contains('button', 'Edit').should('not.exist');
  });

  it('should navigate to session detail', () => {
    openFirstSessionDetail('session-detail.json');

    cy.contains('Morning Yoga').should('be.visible');
    cy.contains('1 attendees').should('be.visible');
    cy.contains('Margot').should('be.visible');
  });

  it('should allow user to participate in a session', () => {
    openFirstSessionDetail('session-detail-not-participating.json');

    cy.intercept('POST', '/api/session/1/participate/2', {
      statusCode: 200,
      body: {}
    }).as('participate');

    cy.intercept('GET', '/api/session/1', { fixture: 'session-detail.json' }).as('getSessionDetailAfterParticipate');

    cy.contains('button', 'Participate').should('be.visible').click();

    cy.wait('@participate').its('response.statusCode').should('eq', 200);
    cy.wait('@getSessionDetailAfterParticipate').its('response.statusCode').should('eq', 200);

    cy.contains('button', 'Do not participate').should('be.visible');
  });

  it('should allow user to unparticipate from a session', () => {
    openFirstSessionDetail('session-detail.json');

    cy.intercept('DELETE', '/api/session/1/participate/2', {
      statusCode: 200,
      body: {}
    }).as('unparticipate');

    cy.intercept('GET', '/api/session/1', { fixture: 'session-detail-not-participating.json' }).as('getSessionDetailAfterUnparticipate');

    cy.contains('button', 'Do not participate').should('be.visible').click();

    cy.wait('@unparticipate').its('response.statusCode').should('eq', 200);
    cy.wait('@getSessionDetailAfterUnparticipate').its('response.statusCode').should('eq', 200);

    cy.contains('button', 'Participate').should('be.visible');
  });

  it('should navigate back from session detail', () => {
    openFirstSessionDetail('session-detail.json');

    cy.get('button[mat-icon-button]').first().click();
    cy.location('pathname').should('eq', '/sessions');
  });
});
