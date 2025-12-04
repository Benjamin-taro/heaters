import { TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { Listings } from './listings';
import { PostService } from '../../core/post';
import { AuthService } from '../../core/auth';   // ★ 追加

describe('Listings', () => {
  let postServiceMock: jasmine.SpyObj<PostService>;
  let paramMapSubject: BehaviorSubject<any>;
  let authServiceMock: Partial<AuthService>;
  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>('PostService', ['getPosts']);
    postServiceMock.getPosts.and.returnValue(of([]));  // 空配列を返すダミー

    // /posts または /posts/:type の paramMap を模倣する Subject
    paramMapSubject = new BehaviorSubject(
      convertToParamMap({}) // type なし（= 全部）という状態
    );

    await TestBed.configureTestingModule({
      imports: [Listings],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          // ★ AuthService もダミーを差し込む
          provide: AuthService,
          useValue: {
            user$: of(null),          // MyPage と同じノリで最低限これだけ
            // 必要なら logout とかも追加できる
          } as Partial<AuthService>,
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Listings);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
