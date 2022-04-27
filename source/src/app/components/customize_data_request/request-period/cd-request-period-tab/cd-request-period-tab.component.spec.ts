import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRequestPeriodTabComponent } from './cd-request-period-tab.component';

describe('CdRequestPeriodTabComponent', () => {
  let component: CdRequestPeriodTabComponent;
  let fixture: ComponentFixture<CdRequestPeriodTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdRequestPeriodTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdRequestPeriodTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
