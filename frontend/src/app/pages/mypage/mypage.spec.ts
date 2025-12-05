import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MyPage } from './mypage';
import { AuthService } from '../../core/auth';

describe('MyPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPage],
      providers: [
        {
          provide: AuthService,
          useValue: {
            // MyPage 側が subscribe してるであろう user$ だけ用意すればOK
            user$: of(null),
            // もし logout() とか使ってるならダミー関数も足しておく
            logout: jasmine.createSpy('logout'),
          } as Partial<AuthService>,
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyPage);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
