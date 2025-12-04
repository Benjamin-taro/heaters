import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Home } from './home';
import { PostService } from '../../core/post';
import { AuthService } from '../../core/auth';
import { RouterTestingModule } from '@angular/router/testing';  // ★ 追加

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let postServiceMock: jasmine.SpyObj<PostService>;

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>('PostService', [
      'getPostLatests',
    ]);
    postServiceMock.getPostLatests.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        Home,
        RouterTestingModule,   // ★ これを入れると ActivatedRoute / routerLink 周りの provider が揃う
      ],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        {
          provide: AuthService,
          useValue: {
            user$: of(null),
          } as Partial<AuthService>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
