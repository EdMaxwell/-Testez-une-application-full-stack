import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have onError=false initially', () => {
    expect(component.onError).toBe(false);
  });

  it('should call authService.register and navigate to /login on success', () => {
    jest.spyOn(authService, 'register').mockReturnValue(of(undefined));
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({
      email: 'test@test.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'password123'
    });
    component.submit();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should set onError=true on register failure', () => {
    jest.spyOn(authService, 'register').mockReturnValue(throwError(() => new Error('Error')));
    component.form.setValue({
      email: 'test@test.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'password123'
    });
    component.submit();
    expect(component.onError).toBe(true);
  });
});
