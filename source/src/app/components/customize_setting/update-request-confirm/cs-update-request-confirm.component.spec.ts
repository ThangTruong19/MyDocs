import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsUpdateRequestConfirmComponent } from './cs-update-request-confirm.component';

describe('CsUpdateRequestConfirmComponent', () => {
  let component: CsUpdateRequestConfirmComponent;
  let fixture: ComponentFixture<CsUpdateRequestConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsUpdateRequestConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsUpdateRequestConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
