import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Labels, Resources } from '../../../../types/common';
import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import {
  ModelSettingSearchParams,
  ModelSettingData,
  MakerDivision,
  ModelSettingUpdateParams,
  Model,
  ModelForUpdate,
} from '../../../../types/opa/management-car-setting/model-setting';

import { CommonState } from '../../../../constants/common-state';

import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { ModelSelectModalComponent } from '../shared/select-modal/model-select-modal.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ManagementCarSettingService } from '../../../../services/opa/management-car-setting/management-car-setting.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { ScreenCode } from '../../../../constants/opa/screen-codes/management-car-setting';

@Component({
  selector: 'app-model-setting',
  templateUrl: './model-setting.component.html',
  styleUrls: ['./model-setting.component.scss'],
})
export class ModelSettingComponent extends KbaAbstractRegisterComponent {
  @ViewChild('settingModalContent', { static: false })
  settingModalContent: TemplateRef<null>;
  @ViewChild('groupIDSelection', { static: false })
  groupIDSelection: KbaSelectedComponent;
  @ViewChild('makerCodeSelect', { static: false })
  makerCodeSelect: KbaSelectedComponent;
  @ViewChild('divisionCodeSelect', { static: false })
  divisionCodeSelect: KbaSelectedComponent;
  @ViewChild(ModelSelectModalComponent, { static: false })
  modelSelectModal: ModelSelectModalComponent;

  labels: Labels;
  resource: Resources;
  params: ModelSettingUpdateParams;
  searchParams: ModelSettingSearchParams = {};
  allData: ModelSettingData;
  originalData: ModelSettingData;
  srcData: ModelSettingData;
  visibleData: ModelSettingData;
  confirmData: ModelSettingData;
  screenCode = ScreenCode.modelSetting;

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
   * 設定機種選択ボタン押下時の処理
   */
  onClickModelSettingSelectBtn() {
    this.modalService.open(
      {
        title: this.labels.model_select_modal_title,
        labels: this.labels,
        content: this.settingModalContent,
        okBtnLabel: this.labels.reflect,
        showCloseBtn: true,
        enableOk: false,
        ok: async () => {
          this.srcData = this._createSrcData(
            this.srcData || this.allData,
            this.modelSelectModal.data
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
          await this.managementCarSettingService.updateModelSettings(
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
          await this.managementCarSettingService.updateModelSettings(
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
  async onMakerCodeChange(makerCode: string) {
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
   * セルのクラスを判定する
   * @param model 機種
   * @param makerDivision メーカ・車種
   */
  getCellClasses = (model: Model, makerDivision: MakerDivision) => {
    const classes = {
      'cell-green': false,
      'cell-red': false,
    };

    if (!this.visibleData) {
      return classes;
    }

    const originalMakerDivision = this.managementCarSettingService.findMakerDivision(
      this.originalData.model_setting.maker_divisions,
      makerDivision
    );

    if (
      originalMakerDivision.models.find(_model => model.id === _model.id) ==
      null
    ) {
      classes['cell-green'] = true;
    } else if (model.active_kind === CommonState.off) {
      classes['cell-red'] = true;
    }

    return classes;
  };

  /**
   * フィルタリングしたメーカ・車種を返却する
   *
   * @param makerDivisions メーカ・車種の配列
   */
  filterMakerDivision(
    makerDivisions: MakerDivision[],
    makerCode: string,
    divisionCode: string
  ) {
    return makerDivisions.filter(
      makerDivision =>
        makerDivision.maker_code === makerCode &&
        makerDivision.division_code === divisionCode
    );
  }

  protected async _fetchDataForInitialize() {
    const res = await this.managementCarSettingService.fetchModelSettingInitData();

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (!this.exists('model_setting.group_id')) {
      [this.allData, this.originalData] = await this._getOriginalData();
    }
  }

  /**
   * 内部で使用するデータを更新する
   * @param current 現在のデータ
   * @param updated 更新されたデータ
   */
  private _createSrcData(current: ModelSettingData, updated: ModelSettingData) {
    const result: ModelSettingData = _.cloneDeep(current);

    result.model_setting.maker_divisions.forEach(makerDivision => {
      const updatedMakerDivision = this.managementCarSettingService.findMakerDivision(
        updated.model_setting.maker_divisions,
        makerDivision
      );

      if (updatedMakerDivision == null) {
        return;
      }

      makerDivision.models = makerDivision.models.map(
        model =>
          updatedMakerDivision.models.find(_model => model.id === _model.id) ||
          model
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
    original: ModelSettingData,
    data: ModelSettingData
  ) {
    const result: ModelSettingData = _.cloneDeep(original);

    data.model_setting.maker_divisions.forEach(
      (makerDivision: MakerDivision) => {
        const targetMakerDivision = this.managementCarSettingService.findMakerDivision(
          result.model_setting.maker_divisions,
          makerDivision
        );

        if (targetMakerDivision.models.length === 0) {
          targetMakerDivision.models = makerDivision.models.filter(
            model => !!+model.active_kind
          );
        } else {
          targetMakerDivision.models = _.unionBy(
            makerDivision.models,
            targetMakerDivision.models,
            'id'
          ).filter((model: Model) => {
            const targetModel = targetMakerDivision.models.find(
              _model => model.id === _model.id
            );

            if (targetModel == null && model.active_kind === CommonState.off) {
              return false;
            }

            return true;
          });
        }
      }
    );

    return result;
  }

  /**
   * 確認モーダルに表示するデータを更新する
   * @param data データ
   */
  private _createConfirmData(data: ModelSettingData) {
    const result: ModelSettingData = _.cloneDeep(data);

    result.model_setting.maker_divisions.forEach(
      makerDivision =>
        (makerDivision.models = makerDivision.models.filter(model => {
          const classes = this.getCellClasses(model, makerDivision);
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
    originalData: ModelSettingData,
    confirmData: ModelSettingData
  ) {
    const { group_id, update_datetime } = originalData.model_setting;

    const models = confirmData.model_setting.maker_divisions.reduce(
      (result: ModelForUpdate[], makerDivision) =>
        result.concat(
          makerDivision.models.map(model => ({
            model: model.model,
            active_kind: model.active_kind,
            maker_code: makerDivision.maker_code,
          }))
        ),
      []
    );

    return {
      model_setting: {
        group_id,
        update_datetime,
        models,
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
   * @param searchParams 検索条件
   */
  private async _fetchAllData() {
    return this.managementCarSettingService.fetchModelSettings({
      ...this.searchParams,
    });
  }

  /**
   * 設定済みの機種のみを取得する
   * @param data データ
   */
  private async _getOriginalData() {
    const data = (await this._fetchAllData()).result_data;

    return [
      data,
      {
        model_setting: {
          ...data.model_setting,
          maker_divisions: data.model_setting.maker_divisions.map(
            makerDivision => ({
              ...makerDivision,
              models: makerDivision.models.filter(
                model => model.active_kind === CommonState.on
              ),
            })
          ),
        },
      },
    ];
  }
}
