import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { PostDetail } from './post-detail';
import { PostService } from '../../core/post'; // 実際のパスに合わせて

describe('PostDetail', () => {
  let paramMapSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject(
      convertToParamMap({ id: 'test-post-id' }) // /posts/:id 想定
    );

    await TestBed.configureTestingModule({
      imports: [PostDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
            snapshot: { paramMap: paramMapSubject.value },
          },
        },
        {
          // PostService 使ってるなら最低限モックを差す
          provide: PostService,
          useValue: {
            getPosts: () => paramMapSubject.asObservable(), // 実装に合わせて適当に
          } as Partial<PostService>,
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PostDetail);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
