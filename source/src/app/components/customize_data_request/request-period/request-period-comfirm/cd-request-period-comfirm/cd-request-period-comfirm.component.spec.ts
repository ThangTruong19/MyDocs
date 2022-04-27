import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestPeriodComfirmComponent } from './cd-request-period-comfirm.component';

describe('CdRequestPeriodComfirmComponent', () => {
  let component: CdRequestPeriodComfirmComponent;
  let fixture: ComponentFixture<CdRequestPeriodComfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestPeriodComfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestPeriodComfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
