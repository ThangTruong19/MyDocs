import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestNumberListComponent } from './cd-request-number-list.component';

describe('CdRequestNumberListComponent', () => {
  let component: CdRequestNumberListComponent;
  let fixture: ComponentFixture<CdRequestNumberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestNumberListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestNumberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
