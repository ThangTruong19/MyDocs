import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupNewComponent } from './group-new.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupService } from '../../../../services/opa/group/group.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { GroupDetailModalComponent } from '../shared/detail-modal/detail-modal.component';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('GroupNewComponent', () => {
  let component: GroupNewComponent;
  let fixture: ComponentFixture<GroupNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupNewComponent, GroupDetailModalComponent],
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
    fixture = TestBed.createComponent(GroupNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
