import { TestBed } from '@angular/core/testing';

import { Memo } from './memo';

describe('Memo', () => {
  let service: Memo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Memo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
