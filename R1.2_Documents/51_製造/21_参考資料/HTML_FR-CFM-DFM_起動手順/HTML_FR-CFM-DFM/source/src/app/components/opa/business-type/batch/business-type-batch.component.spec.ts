import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { BusinessTypeBatchComponent } from './business-type-batch.component';

import { BusinessTypeService } from '../../../../services/opa/business-type/business-type.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('BusinessTypeBatchComponent', () => {
  let component: BusinessTypeBatchComponent;
  let fixture: ComponentFixture<BusinessTypeBatchComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessTypeBatchComponent],
      imports: [NgbModule, RouterTestingModule, KbaCommonModule],
      providers: [
        BusinessTypeService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessTypeBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-page-title'));
      el = de.nativeElement;
      expect(el.innerHTML).toEqual('業種管理 一括登録/変更');
    });
  });
});
