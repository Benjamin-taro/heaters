import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Posting } from './posting';

describe('Posting', () => {
  let component: Posting;
  let fixture: ComponentFixture<Posting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Posting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Posting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
