import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsGetRequestComponent } from './cs-get-request.component';

describe('CsGetRequestComponent', () => {
  let component: CsGetRequestComponent;
  let fixture: ComponentFixture<CsGetRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsGetRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsGetRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
