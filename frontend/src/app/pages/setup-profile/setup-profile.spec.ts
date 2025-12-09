import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SetupProfile } from './setup-profile';
import { Firestore } from '@angular/fire/firestore';   // ★ 追加
import { AuthService } from '../../core/auth';          // ★ 多分使ってるので追加（使ってなかったら消してOK）

describe('SetupProfile', () => {
  let component: SetupProfile;
  let fixture: ComponentFixture<SetupProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupProfile],
      providers: [
        {
          // ★ SetupProfile が inject(Firestore) しているので、ダミー登録
          provide: Firestore,
          useValue: {} as Firestore,
        },
        {
          // ★ プロフィールセット時に AuthService 使ってるならダミーを入れておく
          provide: AuthService,
          useValue: {
            user$: of(null),
          } as Partial<AuthService>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
