import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaAlertModule } from '../../../modules/shared/kba-alert.module';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { KbaMimeType } from '../../../constants/mime-types';

import { KbaFileUploadComponent } from './kba-file-upload.component';

import { KbaFileUploadService } from '../../../services/shared/kba-file-upload.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { ResourceService } from '../../../services/api/resource.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

describe('KbaFileUploadComponent', () => {
  let component: KbaFileUploadComponent;
  let fixture: ComponentFixture<KbaFileUploadComponent>;
  let fileUploadService: KbaFileUploadService;
  let alertService: KbaAlertService;
  let titleDebug: DebugElement;
  let titleEl: HTMLElement;
  let selectButtonDebug: DebugElement;
  let selectButtonEl: HTMLElement;
  let dropBoxDebug: DebugElement;
  let dropBoxEl: HTMLElement;
  let uploadFiles: File[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        KbaAlertModule,
        FileUploadModule,
        RouterTestingModule,
        KbaCommonModule,
      ],
      providers: [
        ApiService,
        UserSettingService,
        ResourceService,
        KbaAlertService,
        KbaFileUploadService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaFileUploadComponent);
    component = fixture.componentInstance;
    component.path = 'operatorId/upload';
    component.layout = 'batch';
    component.uploadOnChange = true;
    component.labels = {};
    component.json = '{}';
    fileUploadService = fixture.debugElement.injector.get(KbaFileUploadService);
    alertService = fixture.debugElement.injector.get(KbaAlertService);
    fixture.detectChanges();
    spyOn(fileUploadService, 'upload').and.callFake((type, file) => {
      return new Promise((resolve, reject) => {
        resolve({ test: 'test' });
      });
    });
    spyOn(alertService, 'show');
    titleDebug = fixture.debugElement.query(By.css('.panel-title'));
    titleEl = titleDebug.nativeElement;
    selectButtonDebug = fixture.debugElement.query(
      By.css('.KBA-input-file > input')
    );
    selectButtonEl = selectButtonDebug.nativeElement;
    dropBoxDebug = fixture.debugElement.query(By.css('.KBA-drop-box'));
    dropBoxEl = dropBoxDebug.nativeElement;
    uploadFiles = [
      new File(['a,b,c,d'], 'test.xlsx', { type: KbaMimeType.excel }),
    ];
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    component.labels.upload_title = 'Test Title';
    fixture.detectChanges();
    expect(titleEl.textContent).toContain('Test Title');
  });

  describe('選択ボタンからファイルを選択したとき', () => {
    beforeEach(() => {
      component.uploader.addToQueue(uploadFiles);
      selectButtonDebug.triggerEventHandler('change', null);
      fixture.detectChanges();
    });

    it('ファイルアップロードAPIがリクエストされること', async(() => {
      fixture.whenStable().then(() => {
        expect(fileUploadService.upload).toHaveBeenCalledTimes(1);
      });
    }));

    it('リクエストにはタイプとファイル情報が渡されること', async(() => {
      fixture.whenStable().then(() => {
        expect(fileUploadService.upload).toHaveBeenCalledWith(
          component.path,
          uploadFiles[0],
          component.json
        );
      });
    }));

    it('ファイルの選択状態が解除されること', async(() => {
      fixture.whenStable().then(() => {
        expect(component.uploader.queue.length).toBe(0);
      });
    }));
  });

  describe('ドロップエリアにファイルをドロップしたとき', () => {
    beforeEach(() => {
      component.uploader.addToQueue(uploadFiles);
      dropBoxDebug.triggerEventHandler('onFileDrop', null);
      fixture.detectChanges();
    });

    it('ファイルアップロードAPIがリクエストされること', async(() => {
      fixture.whenStable().then(() => {
        expect(fileUploadService.upload).toHaveBeenCalledTimes(1);
      });
    }));

    it('リクエストにはタイプとファイル情報が渡されること', async(() => {
      fixture.whenStable().then(() => {
        expect(fileUploadService.upload).toHaveBeenCalledWith(
          component.path,
          uploadFiles[0],
          component.json
        );
      });
    }));

    it('ファイルの選択状態が解除されること', async(() => {
      fixture.whenStable().then(() => {
        expect(component.uploader.queue.length).toBe(0);
      });
    }));
  });

  describe('ファイルが選択状態にない時にイベントが起こっても', () => {
    beforeEach(() => {
      selectButtonDebug.triggerEventHandler('change', null);
      fixture.detectChanges();
    });

    it('ファイルアップロードAPIがリクエストされないこと', async(() => {
      fixture.whenStable().then(() => {
        expect(fileUploadService.upload).toHaveBeenCalledTimes(0);
      });
    }));
  });
});
