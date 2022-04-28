import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdNumberListRequestTabComponent } from './cd-number-list-request-tab.component';

describe('CdNumberListRequestTabComponent', () => {
  let component: CdNumberListRequestTabComponent;
  let fixture: ComponentFixture<CdNumberListRequestTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdNumberListRequestTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdNumberListRequestTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
