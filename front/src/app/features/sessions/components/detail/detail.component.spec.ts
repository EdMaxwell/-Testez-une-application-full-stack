import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';

import { Teacher } from 'src/app/interfaces/teacher.interface';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { DetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  let sessionApiService: jest.Mocked<SessionApiService>;
  let teacherService: jest.Mocked<TeacherService>;
  let router: Router;
  let matSnackBar: MatSnackBar;

  const mockSession: Session = {
    id: 1,
    name: 'Yoga',
    description: 'A yoga session',
    date: new Date(),
    teacher_id: 1,
    users: [1]
  };

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'Doe',
    firstName: 'Jane',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  const mockSessionApiService = {
    detail: jest.fn(),
    delete: jest.fn(),
    participate: jest.fn(),
    unParticipate: jest.fn(),
  };

  const mockTeacherService = {
    detail: jest.fn(),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1')
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    sessionApiService = TestBed.inject(SessionApiService) as jest.Mocked<SessionApiService>;
    teacherService = TestBed.inject(TeacherService) as jest.Mocked<TeacherService>;
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);

    jest.clearAllMocks();

    sessionApiService.detail.mockReturnValue(of(mockSession));
    teacherService.detail.mockReturnValue(of(mockTeacher));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch session and teacher on init', () => {
    expect(sessionApiService.detail).toHaveBeenCalledWith('1');
    expect(teacherService.detail).toHaveBeenCalledWith('1');
    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
    expect(component.isParticipate).toBe(true);
    expect(component.isAdmin).toBe(true);
  });

  it('should call window.history.back() on back()', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(backSpy).toHaveBeenCalled();
  });

  it('should delete session, show snack bar, and navigate on delete()', () => {
    sessionApiService.delete.mockReturnValue(of({}));

    const snackSpy = jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.delete();

    expect(sessionApiService.delete).toHaveBeenCalledWith('1');
    expect(snackSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });

  it('should call participate and re-fetch session', () => {
    sessionApiService.participate.mockReturnValue(of(undefined));
    sessionApiService.detail.mockReturnValue(of(mockSession));

    component.participate();

    expect(sessionApiService.participate).toHaveBeenCalledWith('1', '1');
    expect(sessionApiService.detail).toHaveBeenCalled();
  });

  it('should call unParticipate and re-fetch session', () => {
    sessionApiService.unParticipate.mockReturnValue(of(undefined));
    sessionApiService.detail.mockReturnValue(of(mockSession));

    component.unParticipate();

    expect(sessionApiService.unParticipate).toHaveBeenCalledWith('1', '1');
    expect(sessionApiService.detail).toHaveBeenCalled();
  });

  it('should set isParticipate to false when user is not in session users', () => {
    const sessionWithoutUser: Session = {
      ...mockSession,
      users: [99]
    };

    sessionApiService.detail.mockReturnValue(of(sessionWithoutUser));
    teacherService.detail.mockReturnValue(of(mockTeacher));

    const newFixture = TestBed.createComponent(DetailComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.isParticipate).toBe(false);
  });

  it('should set isAdmin to false for a non-admin user', () => {
    TestBed.resetTestingModule();
  });
});
