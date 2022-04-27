import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { CustomDivisionRegistParams } from '../../../../../types/opa/management-car-setting/custom-division';
import { ModelTypeSettingData } from '../../../../../types/opa/management-car-setting/model-type-setting';

import { CommonState } from '../../../../../constants/common-state';
import { ScreenCode } from '../../../../../constants/opa/screen-codes/management-car-setting';

import { CustomDivisionFormComponent } from '../shared/form/custom-division-form.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { ManagementCarSettingService } from '../../../../../services/opa/management-car-setting/management-car-setting.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-custom-division-new',
  templateUrl: '../shared/form/custom-division-form.component.html',
  styleUrls: ['../shared/form/custom-division-form.component.scss'],
})
export class CustomDivisionNewComponent extends CustomDivisionFormComponent {
  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    managementCarSettingService: ManagementCarSettingService,
    ref: ChangeDetectorRef,
    modalService: KbaModalService,
    alertService: KbaAlertService,
    router: Router,
    elRef: ElementRef
  ) {
    super(
      navigation,
      title,
      header,
      managementCarSettingService,
      ref,
      modalService,
      alertService,
      router,
      elRef
    );
  }

  /**
   * モーダルのデータを整形する
   * @override
   */
  processData = (data: ModelTypeSettingData) => {
    data.model_type_setting.models.forEach(
      model =>
        (model.types = model.types.map(type => ({
          ...type,
          active_kind: CommonState.off,
        })))
    );
    return data;
  };

  /**
   * 設定グループ変更時の処理
   * @param value グループID
   */
  async onGroupIdChange(value: string) {
    super.onGroupIdChange(value);
    this.data = null;
    this.params.custom_division.car_conditions = [];
    await this._fetchNamesByGroupId(this.screenCode, value);
    this._refreshParams();
  }

  /**
   * 登録ボタン押下時の処理
   * @override
   */
  async onClickSubmit() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        try {
          const params = this._formatParam(this.params);
          await this.managementCarSettingService.createCustomDivision(params);
          await this.router.navigateByUrl('/');
          this.alertService.show(this.labels.finish_message);
        } catch (error) {
          this._setError(error, this.alertService);
        }
        break;
      case 'close':
        break;
    }
  }

  /**
   * 続けて登録ボタン押下時の処理
   */
  async onClickContinue() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        try {
          const params = this._formatParam(this.params);
          await this.managementCarSettingService.createCustomDivision(params);
          this.alertService.show(this.labels.finish_message);
          this._reset();
        } catch (error) {
          this._setError(error, this.alertService);
        }
        break;
      case 'close':
        break;
    }
  }

  protected async _fetchDataForInitialize() {
    this.screenCode = ScreenCode.customDivisionRegist;
    const res = await this.managementCarSettingService.fetchCustomDivisionRegistInitData();

    await this.initialize(res);
  }

  /**
   * パラメータを作成する
   * @override
   */
  protected _initializeParams() {
    const result: CustomDivisionRegistParams = {
      custom_division: {
        names: [],
        car_conditions: [],
      },
    };

    result.custom_division.names = this.resource.custom_division.names.label.values.map(
      value => ({
        label: '',
        lang_code: value.value,
      })
    );

    return result;
  }

  /**
   * リセット処理を行う
   * @override
   */
  protected _reset() {
    super._reset();

    if (this.groupIDSelection) {
      this.groupIDSelection.refresh();
    }
  }
}
