import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { Login } from './login';
import { AuthService } from '../../core/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Login,
        RouterTestingModule,  // routerLink とか使ってたらこれが必要
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            user$: of(null),                          // Login で使ってるとしたらこれ
            loginWithGoogle: jasmine.createSpy('loginWithGoogle'),
            logout: jasmine.createSpy('logout'),
          } as Partial<AuthService>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
