import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { CustomCarAttributeEditComponent } from './custom-car-attribute-edit.component';
import { CustomCarAttributeDetailModalComponent } from '../../../../components/opa/custom-car-attribute/shared/modal/custom-car-attribute-detail-modal.component';

import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CustomCarAttributeService } from '../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CustomCarAttributeEditComponent', () => {
  let component: CustomCarAttributeEditComponent;
  let fixture: ComponentFixture<CustomCarAttributeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CustomCarAttributeEditComponent,
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
    fixture = TestBed.createComponent(CustomCarAttributeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
