import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityResponse } from './quality-response';

describe('QualityResponse', () => {
  let component: QualityResponse;
  let fixture: ComponentFixture<QualityResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityResponse],
    }).compileComponents();

    fixture = TestBed.createComponent(QualityResponse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
