import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import {
  ModelSettingSearchParams,
  ModelSettingData,
} from '../../../../../types/opa/management-car-setting/model-setting';

import { ManagementCarSettingService } from '../../../../../services/opa/management-car-setting/management-car-setting.service';
import { CommonState } from '../../../../../constants/common-state';
import { AbstractSelectModalComponent } from './abstract-select-modal.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';

@Component({
  selector: 'app-model-select-modal',
  templateUrl: './select-modal.component.html',
  styleUrls: ['./select-modal.component.scss'],
})
export class ModelSelectModalComponent extends AbstractSelectModalComponent {
  searchParams: ModelSettingSearchParams;
  data: ModelSettingData;
  identifier = 'ModelSelectModalComponent';

  get checkAll() {
    return (
      this.data != null &&
      this.data.model_setting.maker_divisions.every(makerDivision =>
        makerDivision.models.every(
          model => model.active_kind === CommonState.on
        )
      )
    );
  }

  set checkAll(checkAll: boolean) {
    this.data.model_setting.maker_divisions.forEach(makerDivision =>
      makerDivision.models.forEach(
        model => (model.active_kind = `${+checkAll}`)
      )
    );
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    managementCarSettingService: ManagementCarSettingService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef
  ) {
    super(
      navigationService,
      title,
      managementCarSettingService,
      modalService,
      ref
    );
  }

  /**
   * データ取得
   * @param params パラメータ
   */
  protected _fetchData(params: any) {
    return this.managementCarSettingService.fetchModelSettings(params);
  }

  /**
   * 検索結果に更新されたデータをマージする
   * @param searchResult 検索結果
   * @param updated 更新されたデータ
   */
  protected _mergeData(
    searchResult: ModelSettingData,
    updated: ModelSettingData
  ) {
    if (updated == null) {
      return searchResult;
    }

    searchResult.model_setting.maker_divisions.forEach(
      makerDivison =>
        (makerDivison.models = makerDivison.models.map(model => {
          const updatedMakerDivision = this.managementCarSettingService.findMakerDivision(
            updated.model_setting.maker_divisions,
            makerDivison
          );
          const updatedModel =
            updatedMakerDivision &&
            updatedMakerDivision.models.find(_model => model.id === _model.id);

          if (updatedMakerDivision && updatedModel) {
            model.active_kind = updatedModel.active_kind;
          }

          return model;
        }))
    );

    return searchResult;
  }
}
