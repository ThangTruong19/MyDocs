import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, Validators, FormGroup } from '@angular/forms';
import { times, cloneDeep, pick, isEmpty } from 'lodash';

import { CustomCarAttributeParams } from '../../../../types/opa/custom-car-attribute';

import { CustomCarAttributeFormComponent } from '../shared/form/custom-car-attribute-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CustomCarAttributeService } from '../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ScreenCode } from '../../../../constants/opa/screen-codes/custom-car-attribute-management';

@Component({
  selector: 'app-custom-car-attribute-edit',
  templateUrl: '../shared/form/custom-car-attribute-form.component.html',
  styleUrls: ['../shared/form/custom-car-attribute-form.component.scss'],
})
export class CustomCarAttributeEditComponent extends CustomCarAttributeFormComponent {
  isUpdate = true;
  CustomCarAttributeId: string;
  useSameNameDefault: boolean;
  destroyed = false;
  tempParams: CustomCarAttributeParams;
  checkIsEdited = true;
  screenCode = ScreenCode.edit;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    customCarAttributeService: CustomCarAttributeService,
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
      customCarAttributeService,
      modalService,
      ref,
      router,
      alertService
    );
  }

  /**
   * フォームをリセット
   */
  protected _reset(): void {
    if (this.destroyed) {
      return;
    }

    super._reset();
    this.useSameName = this.useSameNameDefault;
    this.customCarAttributeForm.enable();
    this.customCarAttributeForm.markAsPristine();
    this.params = cloneDeep(this.tempParams);
    this.originalParams = cloneDeep(this.tempParams);
    this.displayItemsArray = new FormArray([]);
    times(this.initialDisplayItemsLength, i =>
      this._addDisplayItemFormGroup(i)
    );
    this.displayItemsIndex = this.initialDisplayItemsLength;
    this.setCurrentDisplayItem(this.currentDisplayItem.index);
    this._refreshFormControl();
    this.safeDetectChanges();
  }

  /**
   * 登録処理
   * @param params パラメータ
   */
  protected _register(params: CustomCarAttributeParams): Promise<any> {
    return this.customCarAttributeService.updateCustomCarAttributeService(
      this.CustomCarAttributeId,
      params
    );
  }

  /**
   * 初期化処理
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    this.activatedRoute.params.subscribe(
      p => (this.CustomCarAttributeId = p.id)
    );

    const res: any = await this.customCarAttributeService.fetchEditInitData(
      this.CustomCarAttributeId
    );

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this.params = res.item.result_data;

    if (this.exists('custom_car_attribute.block_id')) {
      const { field_no } = this.params.custom_car_attribute;
      await this.onBlockIdChange(this.params.custom_car_attribute.block_id);
      this.params.custom_car_attribute.field_no = this.resource.custom_car_attribute.field_no.values.find(
        val => val.value === field_no
      ).value;
    }

    this.originalParams = cloneDeep(this.params);
    this.tempParams = cloneDeep(this.params);

    this._setTitle();
    this.initialDisplayItemsLength = this.displayItemsIndex = this.params.custom_car_attribute.details.length;
    this.primaryLang = res.resource.custom_car_attribute.names.values[0].value;

    this._buildFormControls();
    this.useSameName = this.useSameNameDefault = this._getUseSameNameDefault();
    this.onUseSameNameChange(this.useSameNameDefault);
    this.isReady = true;

    setTimeout(() => {
      this._initializeContents();
    });
  }

  /**
   * 表示項目リストを初期化（更新用）
   */
  protected _initializeDisplayItems(index: number): void {
    this.resource.custom_car_attribute.names.values.forEach((v, i) => {
      if (i === 0) {
        return;
      }

      this.params.custom_car_attribute.details[index].names.push({
        label: '',
        lang_code: v.value,
      });
    });
  }

  /**
   * API に投げるパラメータを作成
   */
  protected _buildParams(): CustomCarAttributeParams {
    const params = super._buildParams();
    params.custom_car_attribute = pick(params.custom_car_attribute, [
      'update_datetime',
      'details',
      'names',
      'field_no',
    ]);
    params.custom_car_attribute.names = params.custom_car_attribute.names.map(
      attr => pick(attr, ['lang_code', 'label'])
    );
    params.custom_car_attribute.details.forEach(
      di =>
        (di.names = di.names.map(name => pick(name, ['lang_code', 'label'])))
    );

    return params;
  }

  /**
   * 同じ言語を使用チェックのデフォルト状態を取得
   */
  private _getUseSameNameDefault(): boolean {
    return this.params.custom_car_attribute.details
      .map(d => d.names)
      .concat([this.params.custom_car_attribute.names])
      .every(names => names.every(name => name.label === names[0].label));
  }

  private _convertNames(names: { lang_code: string, label: string }[]) {
    return names.reduce(
      (temp, name) => {
        temp[name.lang_code] = name.label;
        return temp;
      }, {} as { [x: string]: string });
  }

  private _refreshFormControl() {
    const {
      custom_car_attribute: {
        names,
        details,
      },
    } = this.params;

    this.attributeNameGroup
      .setValue(this._convertNames(names));

    this.displayItemsArray
      .setValue(
        details.map(detail => this._convertNames(detail.names))
      );
  }
}
