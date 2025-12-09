import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { Posting } from './posting';
import { PostService } from '../../core/post';
import { AuthService } from '../../core/auth';
import {
  DocumentReference,
  DocumentData,
  Firestore,               // ★ 追加
} from '@angular/fire/firestore';

describe('Posting', () => {
  let postServiceMock: jasmine.SpyObj<PostService>;

  beforeEach(async () => {
    // PostService のメソッドだけを持ったダミーを作る
    postServiceMock = jasmine.createSpyObj<PostService>('PostService', ['createPost']);

    // createPost が Promise を返すのであればこうしておく
    postServiceMock.createPost.and.returnValue(
      Promise.resolve({} as DocumentReference<DocumentData, DocumentData>)
      // めんどかったら Promise.resolve({} as any) でもOK
    );

    await TestBed.configureTestingModule({
      imports: [
        Posting,           // standalone component
        ReactiveFormsModule,
      ],
      providers: [
        // 本物のサービスの代わりにモックを注入
        { provide: PostService, useValue: postServiceMock },
        {
          provide: AuthService,
          useValue: {
            // コンストラクタ内で subscribe してるので、最低限これがあれば十分
            user$: of(null),
          } as Partial<AuthService>,
        },
        {
          // ★ Firestore を「とりあえず存在するだけのダミー」として登録
          provide: Firestore,
          useValue: {} as Firestore,
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Posting);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
