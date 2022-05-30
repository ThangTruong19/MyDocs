import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDataAllCancelConfirmComponent } from './input-data-all-cancel-confirm.component';

describe('InputDataAllCancelConfirmComponent', () => {
  let component: InputDataAllCancelConfirmComponent;
  let fixture: ComponentFixture<InputDataAllCancelConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputDataAllCancelConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDataAllCancelConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
