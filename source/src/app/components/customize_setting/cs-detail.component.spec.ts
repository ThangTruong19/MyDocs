import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsDetailComponent } from './cs-detail.component';

describe('CsDetailComponent', () => {
  let component: CsDetailComponent;
  let fixture: ComponentFixture<CsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
