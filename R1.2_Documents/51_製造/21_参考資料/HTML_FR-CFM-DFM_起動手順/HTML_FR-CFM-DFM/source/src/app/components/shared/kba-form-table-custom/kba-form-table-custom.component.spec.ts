import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaFormTableCustomComponent } from './kba-form-table-custom.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

describe('KbaFormTableCustomComponent', () => {
  let component: KbaFormTableCustomComponent;
  let fixture: ComponentFixture<KbaFormTableCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaFormTableCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
