import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCustomerPublishComponent } from './group-customer-publish.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupService } from '../../../../services/opa/group/group.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ScopeSearchModalComponent } from '../shared/scope-search-modal/scope-search-modal.component';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('GroupCustomerPublishComponent', () => {
  let component: GroupCustomerPublishComponent;
  let fixture: ComponentFixture<GroupCustomerPublishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupCustomerPublishComponent, ScopeSearchModalComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        GroupService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCustomerPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
