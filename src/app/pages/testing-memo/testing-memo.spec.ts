import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingMemo } from './testing-memo';

describe('TestingMemo', () => {
  let component: TestingMemo;
  let fixture: ComponentFixture<TestingMemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingMemo],
    }).compileComponents();

    fixture = TestBed.createComponent(TestingMemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
