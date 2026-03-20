import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [SessionService],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have hide=true and onError=false initially', () => {
    expect(component.hide).toBe(true);
    expect(component.onError).toBe(false);
  });

  it('should call authService.login and navigate on success', () => {
    const sessionInfo: SessionInformation = {
      token: 'token',
      type: 'Bearer',
      id: 1,
      username: 'user@test.com',
      firstName: 'First',
      lastName: 'Last',
      admin: false
    };

    jest.spyOn(authService, 'login').mockReturnValue(of(sessionInfo));
    const logInSpy = jest.spyOn(sessionService, 'logIn');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.setValue({ email: 'user@test.com', password: 'password' });
    component.submit();

    expect(logInSpy).toHaveBeenCalledWith(sessionInfo);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('should set onError=true on login failure', () => {
    jest.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('Unauthorized')));
    component.form.setValue({ email: 'wrong@test.com', password: 'wrong' });
    component.submit();
    expect(component.onError).toBe(true);
  });
});
