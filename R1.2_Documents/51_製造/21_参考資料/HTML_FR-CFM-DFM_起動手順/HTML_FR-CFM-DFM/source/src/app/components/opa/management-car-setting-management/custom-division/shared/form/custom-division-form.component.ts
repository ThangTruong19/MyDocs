import {
  ElementRef,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Resources, Labels, Resource } from '../../../../../../types/common';
import {
  CustomDivisionRegistParams,
  CustomDivisionCarCondition,
  CustomDivisionData,
  CustomDivisionEditParams,
} from '../../../../../../types/opa/management-car-setting/custom-division';
import {
  ModelTypeSettingSearchParams,
  ModelTypeSettingData,
  Model,
} from '../../../../../../types/opa/management-car-setting/model-type-setting';

import { CommonState } from '../../../../../../constants/common-state';

import { KbaAbstractRegisterComponent } from '../../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { ModelTypeSelectModalComponent } from '../../../shared/select-modal/model-type-select-modal.component';
import { KbaSelectedComponent } from '../../../../../shared/kba-selected/kba-selected.component';

import { KbaNavigationService } from '../../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../../services/shared/common-header.service';
import { ManagementCarSettingService } from '../../../../../../services/opa/management-car-setting/management-car-setting.service';
import { KbaModalService } from '../../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../../services/shared/kba-alert.service';

export abstract class CustomDivisionFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild('settingModalContent', { static: false })
  settingModalContent: TemplateRef<null>;
  @ViewChild(ModelTypeSelectModalComponent, { static: false })
  modelTypeSelectModal: ModelTypeSelectModalComponent;
  @ViewChild('groupIDSelection', { static: false })
  groupIDSelection: KbaSelectedComponent;
  @ViewChild('makerCodeSelect', { static: false })
  makerCodeSelect: KbaSelectedComponent;
  @ViewChild('divisionCodeSelect', { static: false })
  divisionCodeSelect: KbaSelectedComponent;

  params: CustomDivisionRegistParams | CustomDivisionEditParams = {
    custom_division: {
      names: [],
      car_conditions: [],
    },
  };
  originalParams: CustomDivisionRegistParams | CustomDivisionEditParams;
  resource: Resources;
  hostElement: HTMLElement;
  namesParent: HTMLElement;
  namesRoot: HTMLElement;
  namesLabel: Labels = {};
  searchParams: ModelTypeSettingSearchParams = {};
  data: ModelTypeSettingData;
  originalData: ModelTypeSettingData;
  confirmData: ModelTypeSettingData;
  formGroup: FormGroup = new FormGroup({});
  originalFormGroup: FormGroup = new FormGroup({});
  checkIsEdited = false;
  isUpdate = false;
  _useSameName: boolean;
  useSameNameDefault: boolean;
  screenCode: string;
  isReady: boolean;
  _super_initialize = super.initialize;

  get useSameName() {
    return this._useSameName;
  }

  set useSameName(value: boolean) {
    this._useSameName = value;
    value
      ? this.formGroup.controls.others.disable()
      : this.formGroup.controls.others.enable();
  }

  /**
   * モーダルのデータを整形する
   */
  abstract processData: (data: ModelTypeSettingData) => ModelTypeSettingData;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected managementCarSettingService: ManagementCarSettingService,
    protected ref: ChangeDetectorRef,
    protected modalService: KbaModalService,
    protected alertService: KbaAlertService,
    protected router: Router,
    private elRef: ElementRef
  ) {
    super(navigation, title, header);
    this.hostElement = elRef.nativeElement;
  }

  getPrimaryLangLabel(resource: Resource) {
    return (
      `${resource.name}` +
      (resource.values[0] ? `(${resource.values[0].name})` : '')
    );
  }

  /**
   * 設定型式選択ボタン押下時の処理
   */
  onClickModelTypeSettingSelectBtn() {
    this.searchParams.group_id = this.params.custom_division.group_id;

    this.modalService.open(
      {
        title: this.labels.model_type_select_modal_title,
        labels: this.labels,
        content: this.settingModalContent,
        okBtnLabel: this.labels.reflect,
        showCloseBtn: true,
        enableOk: false,
        ok: () => {
          const data = this.modelTypeSelectModal.data;
          data.model_type_setting.models.forEach(
            model =>
              (model.types = model.types.filter(
                type => type.active_kind === CommonState.on
              ))
          );
          this.data = data;
          this.confirmData = this._createConfirmData(this.confirmData, data);
          this.params.custom_division.car_conditions = this._createCarConditionsParams(
            this.confirmData
          );
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * モーダルのOKボタンの初期有効状態を判定する関数
   */
  enableOkFn = (data: ModelTypeSettingData) => {
    return this._isSelectedActiveTypes(data.model_type_setting.models);
  }

  /**
   * 型式選択時の処理
   */
  handleChangeModelTypes = (data: Model[]) => {
    this.modalService.enableOk = this._isSelectedActiveTypes(data);
  }

  /**
   * 登録・続けて登録ボタンの有効状態を判定する
   */
  isSubmitBtnEnabled() {
    return (
      this.params &&
      this.params.custom_division.car_conditions.length > 0 &&
      this.formGroup.valid
    );
  }

  /**
   * コンテンツを初期化
   * @param res APIの戻り値
   * @param data 初期データ
   * @override
   */
  async initialize(res, data?: CustomDivisionData) {
    this._super_initialize(res);

    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    if (this.exists('custom_division.group_id')) {
      const groupId = data
        ? data.group_id
        : this.resource.custom_division.group_id.values[0].value;
      await this._fetchNamesByGroupId(this.screenCode, groupId);
      await this.onGroupIdChange(groupId);
    }
    this.params = this._initializeParams(data);

    if (this.params == null) {
      return;
    }

    this.originalParams = _.cloneDeep(this.params);
    this.isReady = true;
    this.namesLabel = this._createNamesLabel();
    this.formGroup = this._createFormGroup();
    this.safeDetectChanges();
    this.namesParent = <HTMLElement>(
      this.hostElement.querySelector('#names-primary')
    );
    this.namesRoot = <HTMLElement>(
      this.hostElement.querySelector('.primary-block')
    );
    this.useSameName = this.useSameNameDefault = this._getUseSameNameDefault();

    if (data != null) {
      const models = data.models.map(model => ({
        ...model,
        types: model.types.map(type => ({
          ...type,
          active_kind: CommonState.on,
        })),
      }));

      this.data = {
        model_type_setting: {
          models,
          update_datetime: '',
          group_id: '',
          group_label: '',
          group_label_english: '',
        },
      };

      this.originalData = _.cloneDeep(this.data);
      this.confirmData = _.cloneDeep(this.data);
      this.originalFormGroup = _.cloneDeep(this.formGroup);
    }
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * フォーム項目が編集済みであるかを判定する
   * @param original 元の値
   * @param current 現在の値
   */
  isEdited(original: string, current: string) {
    return this.isUpdate && original !== current;
  }

  async onGroupIdChange(groupId: string) {
    const {
      maker_code,
    } = await this.managementCarSettingService.fetchMakerResouceByGroupId(
      this.screenCode,
      groupId
    );
    this.resource.maker_code = maker_code;
    this.confirmData = null;

    if (this.makerCodeSelect) {
      await this.makerCodeSelect.refresh();
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

  /**
   * 登録 / 変更ボタン押下時の処理
   */
  abstract async onClickSubmit();

  /**
   * パラメータを作成する
   */
  protected abstract _initializeParams(data?: CustomDivisionData);

  /**
   * フォームを作成する
   */
  protected _createFormGroup() {
    return new FormGroup({
      [this.resource.custom_division.names.label.values[0]
        .value]: new FormControl('', Validators.required),
      others: new FormGroup(
        this.resource.custom_division.names.label.values.reduce(
          (temp, value, index) => {
            if (index === 0) {
              return temp;
            }

            return {
              ...temp,
              [value.value]: new FormControl('', Validators.required),
            };
          },
          {}
        )
      ),
    });
  }

  /**
   * フォームを更新する
   */
  protected _updateFormGroup() {
    this.formGroup.setControl(
      'others',
      new FormGroup(
        this.resource.custom_division.names.label.values.reduce(
          (temp, value, index) => {
            if (index === 0) {
              return temp;
            }

            const form = this.params.custom_division.names.find(
              name => name.lang_code === value.value
            );
            return {
              ...temp,
              [value.value]: new FormControl(
                form.label || '',
                Validators.required
              ),
            };
          },
          {}
        )
      )
    );
    this.useSameName
      ? this.formGroup.controls.others.disable()
      : this.formGroup.controls.others.enable();
  }

  /**
   * カスタム車種名のラベルを作成する
   */
  protected _createNamesLabel() {
    return this.resource.custom_division.names.label.values.reduce(
      (temp, value) => {
        temp[value.value] = value.name;
        return temp;
      },
      {}
    );
  }

  /**
   * 車種のパラメータを作成する
   * @param data データ
   */
  protected _createCarConditionsParams(data: ModelTypeSettingData) {
    const initialValue: CustomDivisionCarCondition[] = [];

    return data.model_type_setting.models.reduce((temp, model) => {
      return temp.concat(
        model.types.map(type => ({
          type_rev: type.type_rev,
          model: model.model,
          division_code: model.division_code,
          maker_code: model.maker_code,
        }))
      );
    }, initialValue);
  }

  /**
   * リセット処理を行う
   */
  protected _reset() {
    this.data = _.cloneDeep(this.originalData);
    this.confirmData = _.cloneDeep(this.originalData);
    this.useSameName = this.useSameNameDefault;
    if (this.isUpdate) {
      this.params = _.cloneDeep(this.originalParams);
      this.makerCodeSelect.resetAndEmit();
    } else {
      if (this.groupIDSelection) {
        this.groupIDSelection.reset();
      } else {
        this.makerCodeSelect.resetAndEmit();
      }
      this.formGroup.reset();
    }
    this.formGroup.markAsPristine();
    this._clearError();
    this.safeDetectChanges();
  }

  /**
   * 確認モーダルを開く
   */
  protected _registerModalOpen(): Promise<'ok' | 'close'> {
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
   * パラメータを整形する
   * @param params カスタム車種名
   */
  protected _formatParam(
    params: CustomDivisionRegistParams | CustomDivisionEditParams
  ) {
    const result: typeof params = _.cloneDeep(params);

    result.custom_division.names = result.custom_division.names.map(name => ({
      ...name,
      label: this.useSameName
        ? result.custom_division.names[0].label
        : name.label,
    }));

    return result;
  }

  /**
   * メッセージ内のリソースパスをリソース名に置き換える
   * @override
   * @param message メッセージ
   * @param keys エラーレスポンスのキー情報（リソースパスに対応）
   */
  protected _replacePath(message: string, keys: string[]): string {
    return keys.reduce((mesg, key) => {
      let match: RegExpMatchArray | null;
      const rootPath = key.split(/\[\d+\]/)[0];
      const res = _.get(this.resource, rootPath);
      const namesIndex = (match = key.match(/names\[(\d+)\]/)) && +match[1];

      if (res) {
        let suffix = '';

        if (namesIndex != null) {
          suffix += ` (${res.values[namesIndex].name})`;
        }

        return mesg.replace(`{{${key}}}`, res.name + suffix);
      } else {
        return mesg;
      }
    }, message);
  }

  /**
   * グループIDによってカスタム車両名を絞り込み
   * @param value グループID
   */
  protected async _fetchNamesByGroupId(screenCode: string, value: string) {
    const param = {
      group_id: value,
    };
    const res = await this.managementCarSettingService.fetchNamesByGroupId(
      screenCode,
      param
    );

    this.resource.custom_division.names.label = res.custom_division.names.label;
  }

  protected _refreshParams() {
    this.params.custom_division.names = this._refreshNames(
      this.params.custom_division.names,
      this.resource.custom_division.names.label
    );
    this._updateFormGroup();
    this.namesLabel = this._createNamesLabel();
    this.formGroup.markAsPristine();
  }

  private _refreshNames(params, resource) {
    return resource.values.map(val => {
      const temp = this.isUpdate
        ? params.find(name => name.lang_code === val.value)
        : null;

      return (
        temp || {
          lang_code: val.value,
          label: '',
        }
      );
    });
  }

  /**
   * 同じ言語を使用チェックのデフォルト状態を取得
   */
  private _getUseSameNameDefault(): boolean {
    const label = this.params.custom_division.names[0].label;
    return (
      !this.isUpdate ||
      this.params.custom_division.names.every(item => item.label === label)
    );
  }

  /**
   * 確認モーダルに表示するデータを更新する
   * @param current 現在のデータ
   * @param updated 更新されたデータ
   */
  private _createConfirmData(
    current: ModelTypeSettingData,
    updated: ModelTypeSettingData
  ) {
    if (!current) {
      return _.cloneDeep(updated);
    }

    const result: ModelTypeSettingData = _.cloneDeep(current);
    result.model_type_setting.models = _.filter(
      result.model_type_setting.models,
      model => {
        return (
          updated.model_type_setting.models.some(
            m => m.maker_code !== model.maker_code
          ) ||
          updated.model_type_setting.models.some(
            m => m.division_code !== model.division_code
          )
        );
      }
    );
    result.model_type_setting.models = _.unionBy(
      result.model_type_setting.models,
      updated.model_type_setting.models,
      'model_id'
    );

    return result;
  }

  /**
   * 選択済の型式が存在するかどうかを返却する
   *
   * @param data 機種配列
   */
  private _isSelectedActiveTypes(data: Model[]) {
    if (_.isEmpty(data)) {
      return false;
    }

    let decisionModels = this.confirmData
      ? _.cloneDeep(this.confirmData.model_type_setting.models)
      : [];

    decisionModels = _.filter(decisionModels, model => {
      return (
        model.maker_code !== data[0].maker_code ||
        model.division_code !== data[0].division_code
      );
    });
    decisionModels = _.unionBy(decisionModels, data, 'model_id');

    return decisionModels.some(model =>
      model.types.some(type => type.active_kind === CommonState.on)
    );
  }
}
