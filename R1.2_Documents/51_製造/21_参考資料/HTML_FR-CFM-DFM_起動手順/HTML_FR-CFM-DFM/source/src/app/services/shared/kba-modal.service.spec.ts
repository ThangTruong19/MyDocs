import { TestBed, inject } from '@angular/core/testing';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { KbaModalService } from './kba-modal.service';
import { isEqual } from 'lodash';

describe('KbaModalService', () => {
  let subject: KbaModalService = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [KbaModalService],
    });
  });

  beforeEach(inject([KbaModalService], (kbaModalService: KbaModalService) => {
    subject = kbaModalService;
  }));

  it('should be created', () => {
    expect(subject).toBeTruthy();
  });
});
