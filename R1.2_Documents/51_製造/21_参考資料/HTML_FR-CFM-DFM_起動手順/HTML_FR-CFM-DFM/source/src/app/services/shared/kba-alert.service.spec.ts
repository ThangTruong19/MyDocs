import { TestBed, inject } from '@angular/core/testing';

import { KbaAlertService } from './kba-alert.service';

describe('KbaAlertService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KbaAlertService],
    });
  });

  it('should be created', inject(
    [KbaAlertService],
    (service: KbaAlertService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should convert \\n to <br>', inject(
    [KbaAlertService],
    (service: KbaAlertService) => {
      const message = 'alert\ntext';
      service.show(message);
      expect(service.message).toBe('alert<br>text');
    }
  ));
});
