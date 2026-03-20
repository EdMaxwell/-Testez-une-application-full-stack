import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';

import { SessionService } from 'src/app/services/session.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  let sessionApiService: {
    all: jest.Mock;
  };

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga',
      description: 'A yoga session',
      date: new Date(),
      teacher_id: 1,
      users: []
    },
    {
      id: 2,
      name: 'Pilates',
      description: 'A pilates session',
      date: new Date(),
      teacher_id: 2,
      users: []
    }
  ];

  const mockSessionService = {
    sessionInformation: { admin: true }
  };

  beforeEach(async () => {
    sessionApiService = {
      all: jest.fn()
    };

    sessionApiService.all.mockReturnValue(of(mockSessions));

    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: sessionApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose sessionInformation via user getter', () => {
    expect(component.user).toEqual({ admin: true });
  });

  it('should load sessions', (done) => {
    expect(sessionApiService.all).toHaveBeenCalled();

    component.sessions$.subscribe((sessions) => {
      expect(sessions).toEqual(mockSessions);
      done();
    });
  });
});
