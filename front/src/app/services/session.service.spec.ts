import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  const mockSessionInfo: SessionInformation = {
    token: 'token',
    type: 'Bearer',
    id: 1,
    username: 'user@test.com',
    firstName: 'First',
    lastName: 'Last',
    admin: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false from $isLogged initially', (done) => {
    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should logIn and set isLogged to true', (done) => {
    service.logIn(mockSessionInfo);

    expect(service.isLogged).toBe(true);
    expect(service.sessionInformation).toEqual(mockSessionInfo);

    service.$isLogged().subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('should logOut and set isLogged to false', (done) => {
    service.logIn(mockSessionInfo);
    service.logOut();

    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();

    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });
});
