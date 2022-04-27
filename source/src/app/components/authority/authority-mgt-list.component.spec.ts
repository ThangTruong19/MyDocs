import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityMgtListComponent } from './authority-mgt-list.component';

describe('AuthorityMgtListComponent', () => {
  let component: AuthorityMgtListComponent;
  let fixture: ComponentFixture<AuthorityMgtListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityMgtListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityMgtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
