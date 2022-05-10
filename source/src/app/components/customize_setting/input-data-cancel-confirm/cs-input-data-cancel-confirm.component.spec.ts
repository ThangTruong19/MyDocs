import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsInputDataCancelConfirmComponent } from './cs-input-data-cancel-confirm.component';

describe('CsInputDataCancelConfirmComponent', () => {
  let component: CsInputDataCancelConfirmComponent;
  let fixture: ComponentFixture<CsInputDataCancelConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsInputDataCancelConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsInputDataCancelConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
