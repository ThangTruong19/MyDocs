import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import {
  CustomDivisionSearchParams,
  CustomDivisionData,
  CustomDivisionEditParams,
} from '../../../../../types/opa/management-car-setting/custom-division';
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
  selector: 'app-custom-division-edit',
  templateUrl: '../shared/form/custom-division-form.component.html',
  styleUrls: ['../shared/form/custom-division-form.component.scss'],
})
export class CustomDivisionEditComponent extends CustomDivisionFormComponent {
  checkIsEdited = true;
  isUpdate = true;
  customDivisionId: string;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    managementCarSettingService: ManagementCarSettingService,
    ref: ChangeDetectorRef,
    modalService: KbaModalService,
    alertService: KbaAlertService,
    router: Router,
    elRef: ElementRef,
    private activatedRoute: ActivatedRoute
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
  }

  /**
   * 変更ボタン押下時の処理
   * @override
   */
  async onClickSubmit() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        try {
          const params = this._formatParam(this.params);
          await this.managementCarSettingService.updateCustomDivision(
            this.customDivisionId,
            params as CustomDivisionEditParams
          );
          await this.router.navigateByUrl(
            '/management_car_setting/custom_divisions'
          );
          this.alertService.show(this.labels.finish_message);
        } catch (error) {
          this._setError(error, this.alertService);
        }
        break;
      case 'close':
        break;
    }
  }

  protected async _fetchDataForInitialize() {
    const params: CustomDivisionSearchParams = {};
    this.screenCode = ScreenCode.customDivisionEdit;
    this.activatedRoute.params.subscribe(
      p => (params.custom_division_id = p.id)
    );
    this.activatedRoute.queryParams.subscribe(
      p => (params.group_id = p.group_id_param)
    );
    this.customDivisionId = params.custom_division_id;
    const initializeData = await this.managementCarSettingService.fetchCustomDivisionEditInitData();
    const customDivision: CustomDivisionData = (await this.managementCarSettingService.fetchCustomDivisions(
      params
    )).result_data.custom_divisions[0];

    await this.initialize(initializeData, customDivision);
    this._refreshFormControl();
  }

  /**
   * パラメータを作成する
   * @param data 初期データ
   * @override
   */
  protected _initializeParams(
    data: CustomDivisionData
  ): CustomDivisionEditParams | null {
    if (data == null) {
      return null;
    }

    const namesResourceItems = this.resource.custom_division.names.label.values;

    return {
      custom_division: {
        group_id: data.group_id,
        update_datetime: data.update_datetime,
        names: namesResourceItems
          .map(
            ({ value }) =>
              data.names.find(({ lang_code }) => lang_code === value) || {
                lang_code: value,
                label: '',
              }
          )
          .map(name => _.pick(name, ['label', 'lang_code'])),
        car_conditions: data.models.reduce(
          (temp, model) =>
            temp.concat(
              model.types.map(type => ({
                type_rev: type.type_rev,
                model: model.model,
                division_code: model.division_code,
                maker_code: model.maker_code,
              }))
            ),
          []
        ),
      },
    };
  }

  protected _reset() {
    super._reset();
    this._refreshFormControl();
  }

  private _refreshFormControl() {
    const {
      names: [
        {
          lang_code: primaryLang,
          label: primaryLabel,
        },
        ...others
      ],
    } = this.params.custom_division;

    this.formGroup.setValue({
      [primaryLang]: primaryLabel,
      others: others.reduce((temp, { lang_code, label }) => {
        temp[lang_code] = label;
        return temp;
      }, {}),
    });
  }
}
