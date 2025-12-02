import { TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { Listings } from './listings';
import { PostService } from '../../core/post';

describe('Listings', () => {
  let postServiceMock: jasmine.SpyObj<PostService>;
  let paramMapSubject: BehaviorSubject<any>;

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
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Listings);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
