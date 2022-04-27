import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdCurrentRequestComfirmComponent } from './cd-current-request-comfirm.component';

describe('CdCurrentRequestComfirmComponent', () => {
  let component: CdCurrentRequestComfirmComponent;
  let fixture: ComponentFixture<CdCurrentRequestComfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdCurrentRequestComfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdCurrentRequestComfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
