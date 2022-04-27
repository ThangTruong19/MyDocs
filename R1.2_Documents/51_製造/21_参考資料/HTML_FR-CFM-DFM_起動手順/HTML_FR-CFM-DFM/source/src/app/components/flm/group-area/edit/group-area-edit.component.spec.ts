import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { GroupAreaEditComponent } from './group-area-edit.component';

import { GroupAreaService } from '../../../../services/flm/group-area/group-area.service';
import { LandmarkService } from '../../../../services/flm/landmark/landmark.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('GroupAreaEditComponent', () => {
  let component: GroupAreaEditComponent;
  let fixture: ComponentFixture<GroupAreaEditComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupAreaEditComponent],
      imports: [RouterTestingModule, KbaCommonModule],
      providers: [
        GroupAreaService,
        LandmarkService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAreaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', async(() => {
    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-page-title'));
      el = de.nativeElement;
      expect(el.innerHTML).toEqual('エリア管理 グループエリア変更');
    });
  }));
});
