import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsExpectedTrafficConfirmComponent } from './cs-expected-traffic-confirm.component';

describe('CsExpectedTrafficConfirmComponent', () => {
  let component: CsExpectedTrafficConfirmComponent;
  let fixture: ComponentFixture<CsExpectedTrafficConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsExpectedTrafficConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsExpectedTrafficConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
