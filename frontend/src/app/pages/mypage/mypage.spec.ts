import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mypage } from './mypage';

describe('Mypage', () => {
  let component: Mypage;
  let fixture: ComponentFixture<Mypage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mypage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mypage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
