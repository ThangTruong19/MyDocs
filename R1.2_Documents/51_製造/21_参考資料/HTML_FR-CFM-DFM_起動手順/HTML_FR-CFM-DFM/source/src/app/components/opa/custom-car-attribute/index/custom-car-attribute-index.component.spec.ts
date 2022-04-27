import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { CustomCarAttributeIndexComponent } from './custom-car-attribute-index.component';
import { CustomCarAttributeDetailModalComponent } from '../../../../components/opa/custom-car-attribute/shared/modal/custom-car-attribute-detail-modal.component';
import { ApiService } from '../../../../services/api/api.service';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CustomCarAttributeService } from '../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CustomCarAttributeIndexComponent', () => {
  let component: CustomCarAttributeIndexComponent;
  let fixture: ComponentFixture<CustomCarAttributeIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CustomCarAttributeIndexComponent,
        CustomCarAttributeDetailModalComponent,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        CustomCarAttributeService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomCarAttributeIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
