import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { cloneDeep, has, pick, get } from 'lodash';

import { BusinessTypeParams } from '../../../../types/opa/business-type';

import { BusinessTypeFormComponent } from '../shared/form/business-type-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { BusinessTypeService } from '../../../../services/opa/business-type/business-type.service';
import { ScreenCode } from '../../../../constants/opa/screen-codes/business-type-management';

@Component({
  selector: 'app-business-type-edit',
  templateUrl: '../shared/form/business-type-form.component.html',
  styleUrls: ['../shared/form/business-type-form.component.scss'],
})
export class BusinessTypeEditComponent extends BusinessTypeFormComponent {
  isUpdate = true;
  checkIsEdited = true;
  businessTypeId = '';
  useSameNameDefault: boolean;
  businessTypeDataDefault = {};
  screenCode = ScreenCode.edit;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    businessTypeService: BusinessTypeService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    router: Router,
    alertService: KbaAlertService,
    private activatedRoute: ActivatedRoute
  ) {
    super(
      navigation,
      title,
      header,
      businessTypeService,
      modalService,
      ref,
      router,
      alertService
    );
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    this.activatedRoute.params.subscribe(p => (this.businessTypeId = p.id));
    const res = await this.businessTypeService.fetchEditInitData(
      this.businessTypeId
    );
    this.initialize(res);
    this.labels = res.label;
    this._setTitle();
    this.resource = res.resource;
    const blockId = get(res.data.result_data, 'business_type.block_id');

    if (this.exists('business_type.block_id')) {
      await this.handleBlockChange(blockId);
    } else {
      this._refreshParams();
    }
    this._initializeBusinessTypeData(res.data.result_data);
    this.primaryLang = res.resource.business_type.item_names.values[0].value;
    this.businessTypeDataDefault = res.data.result_data;
    this.originalParams = cloneDeep(this.params);
    this.isReady = true;
    this.useSameName = this.useSameNameDefault = this._getUseSameNameDefault();
    this.businessTypeForm.get('setting').setValue(this.useSameNameDefault);
    this._buildFormControls();
    this._initializeContents();
  }

  /**
   * 入力内容をリセット
   */
  protected _reset(): void {
    super._reset();
    this.useSameName = this.useSameNameDefault;
    this._initializeBusinessTypeData(this.businessTypeDataDefault);
    this.businessTypeForm.get('setting').setValue(this.useSameNameDefault);
    this.safeDetectChanges();
    this._rereshFormControl();
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   */
  protected _register(params: BusinessTypeParams): Promise<any> {
    return this.businessTypeService.updateBusinessType(this.businessTypeId, {
      business_type: {
        item_names: params.business_type.item_names,
        update_datetime: params.business_type.update_datetime,
      },
    });
  }

  /**
   * 詳細取得にて得たデータから変更画面の初期パラメータを作成する
   * @param data 業種詳細データ
   */
  private _initializeBusinessTypeData(data) {
    if (has(data, 'business_type.block_id')) {
      this.params.business_type.block_id = data.business_type.block_id;
      this.params.business_type.block_label = data.business_type.block_label;
    }

    this.params.business_type.item_names = this.resource.business_type.item_names.values
      .map(
        ({ value }) =>
          data.business_type.item_names.find(
            ({ lang_code }) => lang_code === value
          ) || {
            lang_code: value,
            label: '',
          }
      )
      .map(item => pick(item, ['lang_code', 'label']));
    this.params.business_type.update_datetime =
      data.business_type.update_datetime;
    this._initializeParams();
  }

  /**
   * 同じ言語を使用チェックのデフォルト状態を取得
   */
  private _getUseSameNameDefault(): boolean {
    const label = this.params.business_type.item_names[0].label;
    return this.params.business_type.item_names.every(
      item => item.label === label
    );
  }

  private _rereshFormControl() {
    this.businessTypeNameGroup.setValue(
      this.params.business_type.item_names.reduce((temp, { lang_code, label }) => {
        temp[lang_code] = label;
        return temp;
      }, {})
    );
  }
}
