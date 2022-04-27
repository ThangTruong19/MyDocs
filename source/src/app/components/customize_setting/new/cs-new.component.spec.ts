import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsNewComponent } from './cs-new.component';

describe('CsNewComponent', () => {
  let component: CsNewComponent;
  let fixture: ComponentFixture<CsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
