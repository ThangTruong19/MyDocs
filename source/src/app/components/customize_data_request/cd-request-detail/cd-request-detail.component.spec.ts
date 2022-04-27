import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestDetailComponent } from './cd-request-detail.component';

describe('CdRequestDetailComponent', () => {
  let component: CdRequestDetailComponent;
  let fixture: ComponentFixture<CdRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
