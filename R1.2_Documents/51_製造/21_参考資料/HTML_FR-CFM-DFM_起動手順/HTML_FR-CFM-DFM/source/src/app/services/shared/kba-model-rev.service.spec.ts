import { TestBed, inject } from '@angular/core/testing';

import { KbaModelRevService } from './kba-model-rev.service';

describe('KbaModelRevService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KbaModelRevService],
    });
  });

  it('should be created', inject(
    [KbaModelRevService],
    (service: KbaModelRevService) => {
      expect(service).toBeTruthy();
    }
  ));
});
