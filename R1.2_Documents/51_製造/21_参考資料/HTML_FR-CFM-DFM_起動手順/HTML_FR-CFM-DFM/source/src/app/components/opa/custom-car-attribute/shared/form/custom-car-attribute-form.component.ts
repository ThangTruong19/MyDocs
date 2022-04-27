import { ViewChild, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { CustomCarAttributeParams } from '../../../../../types/opa/custom-car-attribute';

import { ScreenCode } from '../../../../../constants/opa/screen-codes/custom-car-attribute-management';

import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../../components/shared/kba-form-table-select/kba-form-table-select.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { CustomCarAttributeService } from '../../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { ErrorData } from '../../../../../types/error-data';

export abstract class CustomCarAttributeFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild('fieldNoSelection', { static: false })
  fieldNoSelection: KbaFormTableSelectComponent;
  @ViewChild('blockIdSelection', { static: false })
  blockIdSelection: KbaFormTableSelectComponent;

  abstract checkIsEdited: boolean;

  customCarAttributeForm = new FormGroup({
    custom_car_attribute: new FormGroup({}),
  });
  attributeNameGroup: FormGroup;
  displayItemsArray: FormArray;

  params: CustomCarAttributeParams = {
    custom_car_attribute: {
      field_no: '',
      names: [],
      details: [],
    },
  };
  isUpdate;
  useSameName = true;
  primaryLang: string;
  displayItemsIndex = 0;
  maxDisplayItemCount = 12;
  attributeNameParent;
  attributeNameRoot;
  displayItemParent;
  displayItemRoot;
  currentDisplayItem = {
    item: null,
    originalItem: null,
    index: null,
  };
  initialDisplayItemsLength: number;
  confirmModalHeader: {
    label: string;
    name: string;
    index?: number;
  }[];
  confirmModalParams: CustomCarAttributeParams;
  originalParams: CustomCarAttributeParams;
  isReady = false;
  screenCode: string;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected customCarAttributeService: CustomCarAttributeService,
    protected modalService: KbaModalService,
    protected ref: ChangeDetectorRef,
    protected router: Router,
    protected alertService: KbaAlertService
  ) {
    super(navigation, title, header);
  }

  /**
   * 属性名のメインのテキストボックスに対応するモデルを取得
   * @param source 要素の取得元
   */
  getPrimaryAttributeName(source): any {
    return source.names[0];
  }

  /**
   * 属性名のその他の言語のテキストボックスに対応するモデルを取得
   * @param source 要素の取得元
   */
  getOtherAttributeNames(source): any {
    return source.names.slice(1);
  }

  /**
   * 表示項目リストのメインのテキストボックスに対応するモデルを取得
   * @param item 対象となる項目
   */
  getPrimaryDisplayItemName(item): any {
    if (item == null) {
      return null;
    }
    return item.names[0];
  }

  /**
   * 表示項目リストのその他の言語ののテキストボックスに対応するモデルを取得
   * @param item 対象となる項目
   */
  getOtherDisplayItemNames(item): any {
    if (item == null) {
      return null;
    }
    return item.names.slice(1);
  }

  /**
   * 表示項目を追加
   */
  addDisplayItem(createFormControl = true): void {
    if (createFormControl) {
      this._addDisplayItemFormGroup();
    }

    const item = {
      order: `${++this.displayItemsIndex}`,
      names: [],
    };

    this.resource.custom_car_attribute.details.values.forEach(v => {
      const lang = this.resource.custom_car_attribute.details.values.find(val => val.value === v.value);
      const lang_name = lang ? lang.name : '';

      item.names.push({
        lang_name,
        label: '',
        lang_code: v.value,
      });
    });

    this.params.custom_car_attribute.details.push(item);

    if (
      this.customCarAttributeForm.get('custom_car_attribute.setting') != null
    ) {
      this.onUseSameNameChange(this.useSameName);
    }
  }

  /**
   * 表示項目を削除
   * @param index 項目のインデックス
   */
  removeDisplayItem(index: number): void {
    this.params.custom_car_attribute.details.splice(index, 1);
    this.originalParams.custom_car_attribute.details.splice(index, 1);
    this.displayItemsArray.removeAt(index);
    this._refreshOrder();
    if (this.currentDisplayItem.index === index) {
      this._initializeCurrentDisplayItem();
    } else if (this.currentDisplayItem.index > index) {
      this.setCurrentDisplayItem(this.currentDisplayItem.index - 1);
    }
  }

  /**
   * ブロックID変更時の処理
   * @param value 選択値
   */
  async onBlockIdChange(value: string) {
    const param = {
      block_id: value,
    };

    const res = await this.customCarAttributeService.fetchFieldNoByBlockId(
      this.screenCode,
      param
    );

    this.resource.custom_car_attribute.field_no =
      res.custom_car_attribute.field_no;
    this.resource.custom_car_attribute.names = res.custom_car_attribute.names;
    this.resource.custom_car_attribute.details =
      res.custom_car_attribute.details;
    this.params.custom_car_attribute.field_no = null;
    this.safeDetectChanges();
    await this.fieldNoSelection.refresh();
    this._refreshParams();
    if (this.params.custom_car_attribute.details.length > 0) {
      this._buildFormControls({
        detailsCount: this.params.custom_car_attribute.details.length,
      });
      this.resource.custom_car_attribute.names.values.forEach(
        v =>
          (this.labels[v.value] = this._getLanguageLabelByCode(
            'names',
            v.value
          ))
      );
    }
  }

  /**
   * 現在選択されている表示項目を反映
   * @param index インデックス
   * @param item 項目
   */
  setCurrentDisplayItem(index, item = null, originalItem = null): void {
    this.currentDisplayItem = {
      item: item || this.currentDisplayItem.item,
      originalItem,
      index,
    };

    // 親エレメントの反映を明示的に行うため null を代入する
    this.displayItemParent = null;
    setTimeout(
      () =>
        (this.displayItemParent = document.getElementById(
          `KBA-text-display-items-primary-${index}`
        ))
    );
  }

  /**
   * 登録ボタン押下時の処理
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? '/custom_car_attributes' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下時の処理
   */
  onClickContinue(): void {
    this._registerModalOpen();
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => {
        this._reset();
      },
    });
  }

  /**
   * 同じ名称を使用チェックボックス変化時の処理
   * @param check イベント値
   */
  onUseSameNameChange(check): void {
    this.setCurrentDisplayItem(
      this.currentDisplayItem.index,
      this.params.custom_car_attribute.details[this.currentDisplayItem.index],
      this.originalParams.custom_car_attribute.details[
      this.currentDisplayItem.index
      ]
    );

    this.displayItemsArray.controls
      .concat([this.attributeNameGroup])
      .forEach((fg: FormGroup) => {
        _.forEach(fg.controls, (control: FormControl, key) => {
          if (key === this.primaryLang) {
            return;
          }
          check ? control.disable() : control.enable();
        });
      });
    this.safeDetectChanges();
  }

  /**
   * 入力フォームが不正であるかを判定する
   */
  isFormInvalid() {
    const {
      details,
      names: attributeNames,
      field_no,
    } = this._buildParams().custom_car_attribute;

    return (
      field_no == null ||
      !details
        .map(detail => detail.names)
        .concat([attributeNames])
        .every(names =>
          names.every(name => name.label && name.label.length > 0)
        )
    );
  }

  /**
   * プライマリ言語のラベルを取得する
   * @param path リソースパス
   */
  getPrimaryLangLabel(path: string): string {
    const res = _.get(this.resource, path);
    return res.values[0] ? `${res.name} (${res.values[0].name})` : '';
  }

  /**
   * プライマリ言語がエラーであるかを判定する
   * @param path リソースパス
   */
  primaryLangHasError(path: string): boolean {
    return (
      this.errorData &&
      this.errorData.some(error =>
        error.keys.some(key => key === `${path}[0].label`)
      )
    );
  }

  /**
   * 項目が編集済みであるかをチェック
   * @param item 項目
   * @param original オリジナルの値
   * @param path 比較対象のパス
   */
  isEdited(item, original, path: string): boolean {
    return (
      this.checkIsEdited &&
      item &&
      original &&
      _.get(item, path) !== _.get(original, path)
    );
  }

  /**
   * 入力内容をリセット
   */
  protected _reset(): void {
    this._initializeCurrentDisplayItem();
    this._resetDisplayItems();
    this.alertService.close();
    this._clearError();
  }

  /**
   * 表示項目をリセット（登録用）
   */
  protected _resetDisplayItems(): void { }

  /**
   * コンテンツを初期化
   */
  protected _initializeContents(): void {
    this.resource.custom_car_attribute.names.values.forEach(
      v =>
        (this.labels[v.value] = this._getLanguageLabelByCode('names', v.value))
    );
    this.attributeNameRoot = document.querySelector('.attribute-name-primary');
    this.displayItemRoot = document.querySelector('.display-items-primary');
    this.attributeNameParent = document.getElementById(
      'KBA-text-attribute-name-primary'
    );
    this._initializeCurrentDisplayItem();
  }

  /**
   * フォーム部品を作成
   */
  protected _buildFormControls(
    args: { reset?: boolean; detailsCount?: number } = {}
  ): void {
    const { reset, detailsCount: displayItemsCount } = args;
    const form = this.customCarAttributeForm.controls
      .custom_car_attribute as FormGroup;
    this.attributeNameGroup = this._createAttributeNamesFormGroup(reset);
    form.addControl('attributeName', this.attributeNameGroup);
    this.displayItemsArray = new FormArray([]);
    _.times(displayItemsCount || this.initialDisplayItemsLength, i =>
      this._addDisplayItemFormGroup(i, reset)
    );
    form.addControl('displayItems', this.displayItemsArray);
    this.safeDetectChanges();
  }

  /**
   * API に投げるパラメータを作成
   */
  protected _buildParams(): CustomCarAttributeParams {
    return this._formatParamsForUseSameName(this.params);
  }

  /**
   * パラメータを初期化
   */
  protected _initializeParams(): void {
    this.resource.custom_car_attribute.names.values.forEach(v => {
      if (
        this.params.custom_car_attribute.names.find(
          attr => attr.lang_code === v.value
        ) != null
      ) {
        return;
      }

      this.params.custom_car_attribute.names.push({
        label: '',
        lang_code: v.value,
      });
    });

    _.times(this.initialDisplayItemsLength, i =>
      this.isUpdate
        ? this._initializeDisplayItems(i)
        : this.addDisplayItem(false)
    );
  }

  /**
   * 表示項目リストのフォーム部品を追加
   * @param i インデックス
   */
  protected _addDisplayItemFormGroup(
    i: number = null,
    reset?: boolean
  ): number {
    const fg = new FormGroup({});
    let label;

    this.resource.custom_car_attribute.details.values.forEach((v, j) => {
      if (reset) {
        this.params.custom_car_attribute.details[i].names[j].label = '';
      }
      label =
        i != null
          ? this.params.custom_car_attribute.details[i].names[j].label
          : '';
      fg.addControl(v.value, new FormControl(label, Validators.required));
    });
    this.displayItemsArray.push(fg);
    return this.displayItemsArray.length;
  }

  /**
   * API にデータを投げる
   */
  protected abstract _register(params): Promise<any>;

  /**
   * 表示項目リストを初期化（更新用）
   * @param index インデックス
   */
  protected _initializeDisplayItems(index: number): void { }

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
      const detailsIndex = (match = key.match(/details\[(\d+)\]/)) && +match[1];

      if (res) {
        let suffix = '';

        if (detailsIndex != null) {
          suffix += detailsIndex + 1;
        }

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
   * パラメータの表示項目の order を振り直す
   */
  protected _refreshOrder(): void {
    this.params.custom_car_attribute.details.forEach(
      (item, i) => (item.order = `${i + 1}`)
    );
    this.displayItemsIndex = this.params.custom_car_attribute.details.length;
  }

  /**
   * 言語コードからラベルを取得
   * @param resourcePath 取得元となるリソースのパス
   * @param langCode 言語コード
   */
  private _getLanguageLabelByCode(resourcePath: string, langCode: string): any {
    const result = this.resource.custom_car_attribute[resourcePath].values.find(
      r => r.value === langCode
    );
    return result && result.name;
  }

  /**
   * 現在選択されている表示項目を初期化
   */
  private _initializeCurrentDisplayItem(): void {
    this.setCurrentDisplayItem(
      0,
      this.params.custom_car_attribute.details[0],
      this.originalParams.custom_car_attribute.details[0]
    );
  }

  /**
   * 登録モーダルオープン
   * @param path 処理後に遷移するパス
   */
  private _registerModalOpen(path?: string): void {
    const params = this._buildParams();
    const headerNames = ['field_no', 'use_same_name', 'names.label'];
    if (this.resource.custom_car_attribute.block_id) {
      headerNames.unshift(this.isUpdate ? 'block_label' : 'block_id');
    }
    this.confirmModalHeader = this._buildConfimModalHeader(
      headerNames,
      this.params
    );
    this.confirmModalParams = this._buildConfimModalParams(
      this._formatParamsForUseSameName(this.params)
    );
    this.confirmModalParams.custom_car_attribute.use_same_name = this.useSameName;

    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: async () => {
        this._showLoadingSpinner();

        try {
          await this._register(params);
          if (path) {
            await this.router.navigateByUrl(path);
          } else {
            this._reset();
            this.resource = await this.customCarAttributeService.fetchRegistResource();
            this.safeDetectChanges();
            this.resetAllSelectBoxes();
          }

          this._hideLoadingSpinner();
          this.alertService.show(this.labels.finish_message);
        } catch (errorData) {
          this._setError(errorData, this.alertService);
        }
      },
    });
  }

  /**
   * 属性名称のフォーム部品を作成
   */
  private _createAttributeNamesFormGroup(reset?: boolean): FormGroup {
    const fg = new FormGroup({});
    let label;
    this.resource.custom_car_attribute.names.values.forEach((v, i) => {
      if (reset) {
        this.params.custom_car_attribute.names[i].label = '';
      }
      label = this.params.custom_car_attribute.names[i].label;
      fg.addControl(v.value, new FormControl(label, Validators.required));
    });
    return fg;
  }

  /**
   * 確認モーダルのヘッダを作成する
   * @param headerNames ヘッダの項目名
   * @param params パラメータ
   */
  private _buildConfimModalHeader(
    headerNames: string[],
    params: CustomCarAttributeParams
  ): any {
    return headerNames
      .map(name => {
        const label = (() => {
          switch (name) {
            case 'block_label':
              return this.resource.custom_car_attribute.block_id.name;
            case 'names.label':
              return this.resource.custom_car_attribute.names.name;
            default:
              return _.at(
                this.resource.custom_car_attribute,
                `${name}.name`
              )[0];
          }
        })();
        return {
          name,
          label,
        };
      })
      .concat(
        params.custom_car_attribute.details.map((di, index) => ({
          label: `${this.labels.display_item}${di.order}`,
          name: 'details',
          index,
        }))
      );
  }

  /**
   * 確認モーダルのパラメータを作成する
   * @param params パラメータ
   */
  private _buildConfimModalParams(params: CustomCarAttributeParams): any {
    const result = _.cloneDeep(params);
    if (this.isUpdate) {
      return result;
    }

    if (this.resource.custom_car_attribute.block_id) {
      result.custom_car_attribute.block_label = this.resource.custom_car_attribute.block_id.values.find(
        v => v.value === params.custom_car_attribute.block_id
      ).name;
    }
    result.custom_car_attribute.names.forEach(
      attr =>
        (attr.lang_name = this.resource.custom_car_attribute.names.values.find(
          v => v.value === attr.lang_code
        ).name)
    );
    result.custom_car_attribute.details.forEach(di => {
      di.names.forEach(
        name =>
          (name.lang_name = this.resource.custom_car_attribute.details.values.find(
            v => v.value === name.lang_code
          ).name)
      );
    });

    return result;
  }

  /**
   * 同じ名称を使用用のパラメータを作成
   * @param params パラメータ
   */
  private _formatParamsForUseSameName(params): CustomCarAttributeParams {
    const result: CustomCarAttributeParams = _.cloneDeep(this.params);

    if (this.useSameName) {
      result.custom_car_attribute.names.forEach(
        name => (name.label = result.custom_car_attribute.names[0].label)
      );
      result.custom_car_attribute.details.forEach(item =>
        item.names.forEach(name => (name.label = item.names[0].label))
      );
    }

    return result;
  }

  private _refreshParams() {
    this.params.custom_car_attribute.names = this._refreshNames(
      this.params.custom_car_attribute.names,
      this.resource.custom_car_attribute.names
    );

    this.params.custom_car_attribute.details.forEach(detail => {
      detail.names = this._refreshNames(
        detail.names,
        this.resource.custom_car_attribute.details
      );
    });
  }

  private _refreshNames(params, resource) {
    return resource.values.map(val => {
      const temp = params.find(name => name.lang_code === val.value);

      return (
        temp || {
          lang_code: val.value,
          lang_name: val.name,
          label: '',
        }
      );
    });
  }
}
