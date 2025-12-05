import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';  // ★ 追加

import { PostDetailView } from './post-detail-view';

describe('PostDetailView', () => {
  let component: PostDetailView;
  let fixture: ComponentFixture<PostDetailView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PostDetailView,
        RouterTestingModule,   // ★ これを足す
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
