import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestNumberTabComponent } from './cd-request-number-tab.component';

describe('CdRequestNumberTabComponent', () => {
  let component: CdRequestNumberTabComponent;
  let fixture: ComponentFixture<CdRequestNumberTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestNumberTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestNumberTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
