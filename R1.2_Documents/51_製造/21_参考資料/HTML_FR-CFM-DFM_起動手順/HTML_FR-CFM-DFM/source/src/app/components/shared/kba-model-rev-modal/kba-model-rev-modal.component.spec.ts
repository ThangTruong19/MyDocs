import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { KbaModelRevModalComponent } from './kba-model-rev-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { ApiService } from '../../../services/api/api.service';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ModelRevParams } from '../../../types/flm/model-rev-modal';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

describe('KbaModelRevModalComponent', () => {
  let component: KbaModelRevTestComponent;
  let fixture: ComponentFixture<KbaModelRevTestComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let modal: KbaModelRevModalComponent;
  let api: ApiService;

  @Component({
    selector: 'app-kba-model-rev-test',
    template: `
      <app-kba-model-rev-modal
        [labels]="labels"
        [resource]="resource"
        [params]="params"
        [divisionList]="divisionList"
        [selectedDivisions]="selectedDivisions"
        [showRefModal]="showRefModal"
      ></app-kba-model-rev-modal>
    `,
  })
  class KbaModelRevTestComponent {
    @ViewChild(
      KbaModelRevModalComponent,
      /* TODO: add static flag */ {},
      { static: false }
    )
    modal;

    labels = {};
    resource = {
      model_select_type: {
        name: '機種選択方法',
        type: 10,
        help: '機種選択方法のヘルプ文言',
        values: [
          {
            value: '-99',
            name: '全機種型式',
            kbn: 'D',
          },
          {
            value: '2',
            name: '機種型式を選択',
            kbn: 'D',
          },
        ],
      },
      division_code: {
        name: '車両種類',
        type: 10,
        help: '車両種類のヘルプ文言',
        values: [
          {
            value: '0001',
            name: '油圧ショベル',
            kbn: 'D',
          },
          {
            value: '0002',
            name: 'ホイールローダ',
            kbn: 'D',
          },
          {
            value: '0003',
            name: 'クレーン',
            kbn: 'D',
          },
        ],
      },
    };
    params: ModelRevParams = {
      division: '1',
      modelSelectType: '2',
    };
    divisionList = {};
    selectedDivisions = {};
    showRefModal = () => {};
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaModelRevTestComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaModelRevTestComponent);
    component = fixture.componentInstance;
    modal = component.modal;
    api = fixture.debugElement.injector.get(ApiService);
    api.fetchDivisionList = (params: any) =>
      Promise.resolve({
        result_data: {
          model_types: [
            {
              type: '21',
              rev: 'M0',
              type_rev: '21M0',
              model_id: '0',
              model: 'PD200',
              maker_id: '1',
              maker_code: '0001',
              maker_name: 'コマツ',
              division_id: '1',
              division_code: '0001',
              division_name: '油圧ショベル',
            },
          ],
        },
      });
    spyOn(component, 'showRefModal');

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch divisionList', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(modal.divisionList['0001']).toBeTruthy();
    });
  });

  it('should not show divisions when select "all"', () => {
    modal.params.modelSelectType = '-99';
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(de.query(By.css('.KBA-modal-form__label'))).toBeFalsy();
    });
  });

  it('should toggle selection', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      el = de.query(By.css('.KBA-button-rev')).nativeElement;
      el.click();
      fixture.detectChanges();
      expect(el.classList.contains('btn-active')).toBeTruthy();

      el.click();
      fixture.detectChanges();
      expect(el.classList.contains('btn-active')).toBeFalsy();
    });
  });

  it('should seal ok button', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      const modalService = modal['modalService'];
      expect(modalService.enableOk).toBeFalsy();

      fixture.detectChanges();
      de.query(By.css('.KBA-button-rev')).nativeElement.click();
      fixture.detectChanges();
      expect(modalService.enableOk).toBeTruthy();
    });
  });

  it('should "select all" works', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      const check: HTMLInputElement = de.query(By.css('#model-type-all'))
        .nativeElement;
      expect(check.checked).toBeFalsy();

      check.click();
      fixture.detectChanges();
      expect(modal.isSelectedAll(modal.params.division_code)).toBeTruthy();

      de.query(By.css('.KBA-button-rev')).nativeElement.click();
      fixture.detectChanges();
      expect(modal.isSelectedAll(modal.params.division_code)).toBeFalsy();
    });
  });

  it('should refer button works', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      de.query(By.css('.text-center .btn')).nativeElement.click();
      expect(component.showRefModal).toHaveBeenCalled();
    });
  });
});
