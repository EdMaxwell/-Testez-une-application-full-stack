import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';

import { SessionService } from 'src/app/services/session.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { FormComponent } from './form.component';

describe('FormComponent — Create mode', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiService: {
    create: jest.Mock;
    detail: jest.Mock;
    update: jest.Mock;
  };
  let router: Router;
  let matSnackBar: MatSnackBar;

  const mockSessionService = {
    sessionInformation: { admin: true, id: 1 }
  };

  beforeEach(async () => {
    sessionApiService = {
      create: jest.fn(),
      detail: jest.fn(),
      update: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: sessionApiService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ],
      declarations: [FormComponent]
    }).compileComponents();

    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode with empty form', () => {
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
  });

  it('should create session and navigate on submit', () => {
    const mockSession: Session = {
      name: 'Yoga',
      description: 'A session',
      date: new Date(),
      teacher_id: 1,
      users: []
    };

    sessionApiService.create.mockReturnValue(of(mockSession));

    const snackSpy = jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.sessionForm!.setValue({
      name: 'Yoga',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'A session'
    });

    component.submit();

    expect(sessionApiService.create).toHaveBeenCalled();
    expect(snackSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});

describe('FormComponent — Update mode', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiService: {
    create: jest.Mock;
    detail: jest.Mock;
    update: jest.Mock;
  };
  let router: Router;
  let matSnackBar: MatSnackBar;

  const existingSession: Session = {
    id: 1,
    name: 'Yoga',
    description: 'A session',
    date: new Date('2024-01-01'),
    teacher_id: 1,
    users: []
  };

  const mockSessionService = {
    sessionInformation: { admin: true, id: 1 }
  };

  beforeEach(async () => {
    sessionApiService = {
      create: jest.fn(),
      detail: jest.fn(),
      update: jest.fn()
    };

    sessionApiService.detail.mockReturnValue(of(existingSession));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: sessionApiService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ],
      declarations: [FormComponent]
    }).compileComponents();

    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);

    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/1');

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize in update mode', () => {
    expect(component.onUpdate).toBe(true);
  });

  it('should populate form with existing session data', () => {
    expect(sessionApiService.detail).toHaveBeenCalledWith('1');
    expect(component.sessionForm!.value.name).toBe('Yoga');
  });

  it('should update session and navigate on submit', () => {
    sessionApiService.update.mockReturnValue(of(existingSession));

    const snackSpy = jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.submit();

    expect(sessionApiService.update).toHaveBeenCalled();
    expect(snackSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});

describe('FormComponent — Non-admin redirect', () => {
  it('should redirect to /sessions when user is not admin', async () => {
    const mockSessionServiceNonAdmin = {
      sessionInformation: { admin: false, id: 1 }
    };

    const sessionApiService = {
      create: jest.fn(),
      detail: jest.fn(),
      update: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionServiceNonAdmin },
        { provide: SessionApiService, useValue: sessionApiService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ],
      declarations: [FormComponent]
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);

    TestBed.resetTestingModule();
    jest.restoreAllMocks();
  });
});
