import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { GroupIndexComponent } from './group-index.component';
import { GroupDetailModalComponent } from '../shared/detail-modal/detail-modal.component';

import { GroupService } from '../../../../services/opa/group/group.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('GroupIndexComponent', () => {
  let component: GroupIndexComponent;
  let fixture: ComponentFixture<GroupIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupIndexComponent, GroupDetailModalComponent],
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
    fixture = TestBed.createComponent(GroupIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
