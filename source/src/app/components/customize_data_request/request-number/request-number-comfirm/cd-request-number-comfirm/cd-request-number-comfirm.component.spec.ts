import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestNumberComfirmComponent } from './cd-request-number-comfirm.component';

describe('CdRequestNumberComfirmComponent', () => {
  let component: CdRequestNumberComfirmComponent;
  let fixture: ComponentFixture<CdRequestNumberComfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestNumberComfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestNumberComfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
