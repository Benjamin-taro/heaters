import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPage } from './mypage';

describe('MyPage', () => {
  let component: MyPage;
  let fixture: ComponentFixture<MyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
