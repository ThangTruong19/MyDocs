import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsRequestResendConfirmComponent } from './cs-request-resend-confirm.component';

describe('CsRequestResendConfirmComponent', () => {
  let component: CsRequestResendConfirmComponent;
  let fixture: ComponentFixture<CsRequestResendConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsRequestResendConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsRequestResendConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
