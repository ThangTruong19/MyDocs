import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsImmediateUpdateRequestConfirmComponent } from './cs-immediate-update-request-confirm.component';

describe('CsImmediateUpdateRequestConfirmComponent', () => {
  let component: CsImmediateUpdateRequestConfirmComponent;
  let fixture: ComponentFixture<CsImmediateUpdateRequestConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsImmediateUpdateRequestConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsImmediateUpdateRequestConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
