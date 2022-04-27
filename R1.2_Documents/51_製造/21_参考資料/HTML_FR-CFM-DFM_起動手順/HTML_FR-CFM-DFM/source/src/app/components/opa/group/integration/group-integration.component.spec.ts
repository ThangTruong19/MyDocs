import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupIntegrationComponent } from './group-integration.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupService } from '../../../../services/opa/group/group.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('GroupIntegrationComponent', () => {
  let component: GroupIntegrationComponent;
  let fixture: ComponentFixture<GroupIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupIntegrationComponent],
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
    fixture = TestBed.createComponent(GroupIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
