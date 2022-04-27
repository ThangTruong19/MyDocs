import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SystemNotificationEditComponent } from './system-notification-edit.component';
import { CustomSystemNotificationFormModalComponent } from '../shared/modal/custom-system-notification-form-modal.component';

import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { SystemNotificationService } from '../../../../services/opa/system-notification/system-notification.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SystemNotificationEditComponent', () => {
  let component: SystemNotificationEditComponent;
  let fixture: ComponentFixture<SystemNotificationEditComponent>;
  let systemNotificationService: SystemNotificationService;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SystemNotificationEditComponent,
        CustomSystemNotificationFormModalComponent,
      ],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        SystemNotificationService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SystemNotificationEditComponent);
    component = fixture.componentInstance;
    systemNotificationService = fixture.debugElement.injector.get(
      SystemNotificationService
    );
    systemNotificationService.fetchEditInitData({}).then(res => {
      spyOn(SystemNotificationService, 'fetchEditInitData').and.returnValue(
        Promise.resolve(res)
      );
    });

    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('ページタイトルが正しく表示されること', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      titleDebug = fixture.debugElement.query(By.css('.KBA-page-title'));
      titleEl = titleDebug.nativeElement;
      expect(titleEl.innerHTML).toEqual('システム通知管理　変更');
    });
  }));
});
