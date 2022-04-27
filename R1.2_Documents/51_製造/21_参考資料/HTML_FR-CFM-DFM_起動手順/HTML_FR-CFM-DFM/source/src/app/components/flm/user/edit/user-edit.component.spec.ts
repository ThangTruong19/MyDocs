import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { UserEditComponent } from './user-edit.component';
import { CustomUserFormModalComponent } from '../shared/modal/custom-user-form-modal.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { UserService } from '../../../../services/opa/user/user.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('UserEditComponent', () => {
  let component: UserEditComponent;
  let fixture: ComponentFixture<UserEditComponent>;
  let systemNotificationService: UserService;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserEditComponent, CustomUserFormModalComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        UserService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
    systemNotificationService = fixture.debugElement.injector.get(UserService);
    systemNotificationService.fetchInitNew().then(res => {
      spyOn(UserService, 'fetchInitNew').and.returnValue(Promise.resolve(res));
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
      expect(titleEl.innerHTML).toEqual('ユーザ管理　変更');
    });
  }));
});
