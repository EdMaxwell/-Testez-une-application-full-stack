import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const registerRequest: RegisterRequest = {
    email: 'test@test.com',
    firstName: 'First',
    lastName: 'Last',
    password: 'password'
  };

  const loginRequest: LoginRequest = {
    email: 'test@test.com',
    password: 'password'
  };

  const sessionInfo: SessionInformation = {
    token: 'token',
    type: 'Bearer',
    id: 1,
    username: 'test@test.com',
    firstName: 'First',
    lastName: 'Last',
    admin: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call register endpoint', () => {
    service.register(registerRequest).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);

    req.flush(null);
  });

  it('should call login endpoint and return session information', () => {
    service.login(loginRequest).subscribe((info) => {
      expect(info).toEqual(sessionInfo);
    });

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);

    req.flush(sessionInfo);
  });
});
