import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { FlagConditionNewComponent } from './flag-condition-new.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FlagConditionService } from '../../../../services/opa/flag-condition/flag-condition.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('FlagConditionNewComponent', () => {
  let component: FlagConditionNewComponent;
  let fixture: ComponentFixture<FlagConditionNewComponent>;
  let flagConditionService: FlagConditionService;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlagConditionNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        FlagConditionService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FlagConditionNewComponent);
    component = fixture.componentInstance;
    flagConditionService = fixture.debugElement.injector.get(
      FlagConditionService
    );
    flagConditionService.fetchInitNew().then(res => {
      spyOn(FlagConditionService, 'fetchInitNew').and.returnValue(
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
      expect(titleEl.innerHTML).toEqual('フラグ条件設定管理　登録');
    });
  }));
});
