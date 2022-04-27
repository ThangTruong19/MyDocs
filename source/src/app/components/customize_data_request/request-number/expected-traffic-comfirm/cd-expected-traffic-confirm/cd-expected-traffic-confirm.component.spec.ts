import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdExpectedTrafficConfirmComponent } from './cd-expected-traffic-confirm.component';

describe('CdExpectedTrafficConfirmComponent', () => {
  let component: CdExpectedTrafficConfirmComponent;
  let fixture: ComponentFixture<CdExpectedTrafficConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdExpectedTrafficConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdExpectedTrafficConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
