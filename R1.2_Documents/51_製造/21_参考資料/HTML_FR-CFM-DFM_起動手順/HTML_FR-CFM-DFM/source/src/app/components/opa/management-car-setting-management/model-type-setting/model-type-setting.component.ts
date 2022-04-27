import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Labels, Resources } from '../../../../types/common';
import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import {
  ModelTypeSettingSearchParams,
  ModelTypeSettingData,
  Type,
  Model,
  ModelTypeForUpdate,
  ModelTypeSettingUpdateParams,
} from '../../../../types/opa/management-car-setting/model-type-setting';

import { CommonState } from '../../../../constants/common-state';

import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { ModelTypeSelectModalComponent } from '../shared/select-modal/model-type-select-modal.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ManagementCarSettingService } from '../../../../services/opa/management-car-setting/management-car-setting.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { ScreenCode } from '../../../../constants/opa/screen-codes/management-car-setting';

@Component({
  selector: 'app-model-type-setting',
  templateUrl: './model-type-setting.component.html',
  styleUrls: ['./model-type-setting.component.scss'],
})
export class ModelTypeSettingComponent extends KbaAbstractRegisterComponent {
  @ViewChild('settingModalContent', { static: false })
  settingModalContent: TemplateRef<null>;
  @ViewChild('groupIDSelection', { static: false })
  groupIDSelection: KbaSelectedComponent;
  @ViewChild('makerCodeSelect', { static: false })
  makerCodeSelect: KbaSelectedComponent;
  @ViewChild('divisionCodeSelect', { static: false })
  divisionCodeSelect: KbaSelectedComponent;
  @ViewChild(ModelTypeSelectModalComponent, { static: false })
  modelTypeSelectModal: ModelTypeSelectModalComponent;

  labels: Labels;
  resource: Resources;
  params: ModelTypeSettingUpdateParams;
  searchParams: ModelTypeSettingSearchParams = {};
  allData: ModelTypeSettingData;
  originalData: ModelTypeSettingData;
  srcData: ModelTypeSettingData;
  visibleData: ModelTypeSettingData;
  confirmData: ModelTypeSettingData;
  screenCode = ScreenCode.modelTypeSetting;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    private managementCarSettingService: ManagementCarSettingService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private apiService: ApiService,
    private router: Router
  ) {
    super(navigation, title, header);
  }

  /**
   * グループ変更時の処理
   */
  async onGroupIdChange(groupId: string) {
    this._reset(false);
    this.searchParams = _.pick(this.searchParams, 'group_id');
    [this.allData, this.originalData] = await this._getOriginalData();
    this.confirmData = null;
    const {
      maker_code,
    } = await this.managementCarSettingService.fetchMakerResouceByGroupId(
      this.screenCode,
      groupId
    );
    this.resource.maker_code = maker_code;

    if (this.makerCodeSelect) {
      await this.makerCodeSelect.refresh();
    }
  }

  /**
   * 設定型式選択ボタン押下時の処理
   */
  onClickModelTypeSettingSelectBtn() {
    this.modalService.open(
      {
        title: this.labels.model_type_select_modal_title,
        labels: this.labels,
        content: this.settingModalContent,
        okBtnLabel: this.labels.reflect,
        showCloseBtn: true,
        enableOk: false,
        ok: async () => {
          this.srcData = this._createSrcData(
            this.srcData || this.allData,
            this.modelTypeSelectModal.data
          );
          this.visibleData = this._createVisibleData(
            this.originalData,
            this.srcData
          );
          this.confirmData = this._createConfirmData(this.visibleData);
          this.params = this._createParams(this.originalData, this.confirmData);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: async () => {
        this._reset(true);
      },
    });
  }

  /**
   * 登録ボタン押下時の処理
   */
  async onClickSubmit() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        try {
          await this.managementCarSettingService.updateModelTypeSettings(
            this.params
          );
          await this.router.navigateByUrl('/');
          this.alertService.show(this.labels.finish_message);
        } catch (e) {
          this._setError(e, this.alertService);
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
          await this.managementCarSettingService.updateModelTypeSettings(
            this.params
          );
          this.alertService.show(this.labels.finish_message);
          this._reset(true);
        } catch (e) {
          this._setError(e, this.alertService);
        }
        break;
      case 'close':
        break;
    }
  }

  /**
   * メーカコード変更時のコールバック
   *
   * @param makerCode メーカコード
   */
  async handleChangeMakerCode(makerCode: string) {
    const { group_id } = this.searchParams;
    const {
      division_code,
    } = await this.managementCarSettingService.fetchDivisionResouceByGroupIdAndMakerCode(
      this.screenCode,
      group_id,
      makerCode
    );
    this.resource.division_code = division_code;

    if (this.divisionCodeSelect) {
      await this.divisionCodeSelect.refresh();
    }
  }

  /**
   * モーダルのデータを取得する
   */
  fetchModalData = (params: ModelTypeSettingSearchParams) => {
    return this.managementCarSettingService.fetchModelTypeSettings(params);
  };

  /**
   * セルのクラスを判定する
   * @param type 型式
   * @param model 機種
   */
  getCellClasses = (type: Type, model: Model) => {
    const classes = {
      'cell-green': false,
      'cell-red': false,
    };

    if (!this.visibleData) {
      return classes;
    }

    const originalModel = this.originalData.model_type_setting.models.find(
      _model => model.model_id === _model.model_id
    );

    if (originalModel.types.find(_type => type.id === _type.id) == null) {
      classes['cell-green'] = true;
    } else if (type.active_kind === CommonState.off) {
      classes['cell-red'] = true;
    }

    return classes;
  };

  /**
   * フィルタリングした機種を返却する
   *
   * @param models 機種の配列
   */
  filterModel(models: Model[], makerCode: string, divisionCode: string) {
    return models.filter(
      model =>
        model.maker_code === makerCode && model.division_code === divisionCode
    );
  }

  protected async _fetchDataForInitialize() {
    const res = await this.managementCarSettingService.fetchModelTypeSettingInitData();

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (!this.exists('model_type_setting.group_id')) {
      [this.allData, this.originalData] = await this._getOriginalData();
    }
  }

  /**
   * 内部で使用するデータを更新する
   * @param current 現在のデータ
   * @param updated 更新されたデータ
   */
  private _createSrcData(
    current: ModelTypeSettingData,
    updated: ModelTypeSettingData
  ) {
    const result: ModelTypeSettingData = _.cloneDeep(current);

    result.model_type_setting.models.forEach(model => {
      const updatedModel = updated.model_type_setting.models.find(
        _model => model.model_id === _model.model_id
      );

      if (updatedModel == null) {
        return;
      }

      model.types = model.types.map(
        type => updatedModel.types.find(_type => type.id === _type.id) || type
      );
    });

    return result;
  }

  /**
   * 表示用のデータを更新する
   * @param original 最初に取得したデータ
   * @param data 更新用のデータ
   */
  private _createVisibleData(
    original: ModelTypeSettingData,
    data: ModelTypeSettingData
  ) {
    const result: ModelTypeSettingData = _.cloneDeep(original);

    data.model_type_setting.models.forEach(model => {
      const targetModel = result.model_type_setting.models.find(
        _model => model.model_id === _model.model_id
      );

      if (targetModel.types.length === 0) {
        targetModel.types = model.types.filter(type => !!+type.active_kind);
      } else {
        targetModel.types = _.unionBy(
          model.types,
          targetModel.types,
          'id'
        ).filter((type: Type) => {
          const targetType = targetModel.types.find(
            _type => type.id === _type.id
          );

          if (targetType == null && type.active_kind === CommonState.off) {
            return false;
          }

          return true;
        });
      }
    });

    return result;
  }

  /**
   * 確認モーダルに表示するデータを更新する
   * @param data データ
   */
  private _createConfirmData(data: ModelTypeSettingData) {
    const result: ModelTypeSettingData = _.cloneDeep(data);

    result.model_type_setting.models.forEach(
      model =>
        (model.types = model.types.filter(type => {
          const classes = this.getCellClasses(type, model);
          return classes['cell-green'] || classes['cell-red'];
        }))
    );

    return result;
  }

  /**
   * 変更用のパラメータを生成する
   * @param originalData 最初に取得したデータ
   * @param confirmData 確認用データ
   */
  private _createParams(
    originalData: ModelTypeSettingData,
    confirmData: ModelTypeSettingData
  ) {
    const { group_id, update_datetime } = originalData.model_type_setting;

    const types = confirmData.model_type_setting.models.reduce(
      (result: ModelTypeForUpdate[], model) =>
        result.concat(
          model.types.map(type => ({
            model: model.model,
            maker_code: model.maker_code,
            active_kind: type.active_kind,
            type_rev: type.type_rev,
          }))
        ),
      []
    );

    return {
      model_type_setting: {
        group_id,
        update_datetime,
        model_types: types,
      },
    };
  }

  /**
   * 確認モーダルを開く
   */
  private _registerModalOpen(): Promise<'ok' | 'close'> {
    return new Promise(resolve => {
      this.modalService.open({
        title: this.labels.confirm_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: () => resolve('ok'),
        close: () => resolve('close'),
      });
    });
  }

  /**
   * 表示内容をリセットする
   * @param resetGroup 設定グループをリセットするか
   */
  private _reset(resetGroup) {
    if (this.groupIDSelection && resetGroup) {
      this.groupIDSelection.resetAndEmit();
    } else if (!this.groupIDSelection && resetGroup) {
      this.confirmData = null;
      this.makerCodeSelect.resetAndEmit();
    }

    this.visibleData = null;
    this.srcData = null;
    this.params = null;
    this.safeDetectChanges();
  }

  /**
   * すべてのデータを取得する
   */
  private async _fetchAllData() {
    return this.managementCarSettingService.fetchModelTypeSettings({
      ...this.searchParams,
    });
  }

  /**
   * 設定済みの型式のみを取得する
   * @param data データ
   */
  private async _getOriginalData() {
    const data = (await this._fetchAllData()).result_data;

    return [
      data,
      {
        model_type_setting: {
          ...data.model_type_setting,
          models: data.model_type_setting.models.map(model => ({
            ...model,
            types: model.types.filter(
              type => type.active_kind === CommonState.on
            ),
          })),
        },
      },
    ];
  }
}
