import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdNumberListRequestConfirmComponent } from './cd-number-list-request-confirm.component';

describe('CdNumberListRequestConfirmComponent', () => {
  let component: CdNumberListRequestConfirmComponent;
  let fixture: ComponentFixture<CdNumberListRequestConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdNumberListRequestConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdNumberListRequestConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
