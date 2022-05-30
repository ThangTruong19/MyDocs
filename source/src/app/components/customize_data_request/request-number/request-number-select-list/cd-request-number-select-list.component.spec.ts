import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestNumberSelectListComponent } from './cd-request-number-select-list.component';

describe('CdRequestNumberSelectListComponent', () => {
  let component: CdRequestNumberSelectListComponent;
  let fixture: ComponentFixture<CdRequestNumberSelectListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestNumberSelectListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestNumberSelectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
