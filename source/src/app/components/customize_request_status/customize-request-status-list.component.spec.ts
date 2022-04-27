import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeRequestStatusListComponent } from './customize-request-status-list.component';

describe('CustomizeRequestStatusListComponent', () => {
  let component: CustomizeRequestStatusListComponent;
  let fixture: ComponentFixture<CustomizeRequestStatusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomizeRequestStatusListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizeRequestStatusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
