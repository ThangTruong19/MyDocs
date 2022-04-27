import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { FunctionPublishSettingComponent } from './function-publish-setting.component';
import { ExternalAppPublishSettingComponent } from '../shared/external-app-publish-setting.component';
import { PublishSettingConfirmModalComponent } from '../shared/confirm-modal.component';

import { UserScreenService } from '../../../../services/opa/user-screen/user-screen.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('FunctionPublishSettingComponent', () => {
  let component: FunctionPublishSettingComponent;
  let fixture: ComponentFixture<FunctionPublishSettingComponent>;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FunctionPublishSettingComponent,
        ExternalAppPublishSettingComponent,
        PublishSettingConfirmModalComponent,
      ],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        KbaCommonModule,
        NgbModule,
      ],
      providers: [
        UserScreenService,
        ApiService,
        UserSettingService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FunctionPublishSettingComponent);
    component = fixture.componentInstance;
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
      expect(titleEl.innerHTML).toEqual('ユーザ画面設定管理　メニュー設定');
    });
  }));
});
