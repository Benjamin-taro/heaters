import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MyPage } from './mypage';
import { AuthService } from '../../core/auth';
import { Firestore } from '@angular/fire/firestore';  // ★ 追加

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
        {
          // ★ MyPage 本体が inject(Firestore) しているので、
          //    とりあえず「存在だけするダミー Firestore」を登録する
          provide: Firestore,
          useValue: {} as Firestore,
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
