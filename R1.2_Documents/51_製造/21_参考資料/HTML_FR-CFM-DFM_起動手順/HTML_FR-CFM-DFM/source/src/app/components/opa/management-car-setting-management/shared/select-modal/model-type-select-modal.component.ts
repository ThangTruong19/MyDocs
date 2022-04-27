import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';

import {
  ModelTypeSettingSearchParams,
  ModelTypeSettingData,
  Model,
} from '../../../../../types/opa/management-car-setting/model-type-setting';

import { ManagementCarSettingService } from '../../../../../services/opa/management-car-setting/management-car-setting.service';
import { CommonState } from '../../../../../constants/common-state';
import { AbstractSelectModalComponent } from './abstract-select-modal.component';

import { MakerDivisionsComponent } from '../maker-divisions/maker-divisions.component';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';

@Component({
  selector: 'app-model-type-select-modal',
  templateUrl: './select-modal.component.html',
  styleUrls: ['./select-modal.component.scss'],
})
export class ModelTypeSelectModalComponent extends AbstractSelectModalComponent {
  searchParams: ModelTypeSettingSearchParams;
  data: ModelTypeSettingData;
  identifier = 'ModelTypeSelectModalComponent';

  get checkAll() {
    return (
      this.data != null &&
      this.data.model_type_setting.models.every(model =>
        model.types.every(type => type.active_kind === CommonState.on)
      )
    );
  }

  set checkAll(checkAll: boolean) {
    this.data.model_type_setting.models.forEach(model =>
      model.types.forEach(type => (type.active_kind = `${+checkAll}`))
    );

    if (this.onChange) {
      this.onChange(this.data.model_type_setting.models);
    }
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

  @Input() onChange: (data: Model[]) => void = data => {};

  /**
   * データ取得
   * @param params パラメータ
   */
  protected _fetchData(params: any) {
    return this.managementCarSettingService.fetchModelTypeSettings(params);
  }

  /**
   * 検索結果に更新されたデータをマージする
   * @param searchResult 検索結果
   * @param updated 更新されたデータ
   */
  protected _mergeData(
    searchResult: ModelTypeSettingData,
    updated: ModelTypeSettingData
  ) {
    if (updated == null) {
      return searchResult;
    }

    searchResult.model_type_setting.models.forEach(
      model =>
        (model.types = model.types.map(type => {
          const updatedModel = updated.model_type_setting.models.find(
            _model => model.model_id === _model.model_id
          );
          const updatedType =
            updatedModel &&
            updatedModel.types.find(_type => type.id === _type.id);

          if (updatedModel && updatedType) {
            type.active_kind = updatedType.active_kind;
          }

          return type;
        }))
    );

    return searchResult;
  }
}
