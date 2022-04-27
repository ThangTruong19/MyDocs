import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsEditComponent } from './cs-edit.component';

describe('CsEditComponent', () => {
  let component: CsEditComponent;
  let fixture: ComponentFixture<CsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
