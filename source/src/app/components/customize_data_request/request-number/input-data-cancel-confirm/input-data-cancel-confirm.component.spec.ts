import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDataCancelConfirmComponent } from './input-data-cancel-confirm.component';

describe('InputDataCancelConfirmComponent', () => {
  let component: InputDataCancelConfirmComponent;
  let fixture: ComponentFixture<InputDataCancelConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputDataCancelConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDataCancelConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
