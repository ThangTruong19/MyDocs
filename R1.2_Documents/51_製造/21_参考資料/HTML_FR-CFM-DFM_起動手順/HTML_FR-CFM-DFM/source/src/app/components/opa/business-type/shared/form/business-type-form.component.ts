import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators, Form } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { BusinessTypeParams } from '../../../../../types/opa/business-type';
import { ModalDescItem } from '../../../../../types/common';
import { ErrorData } from '../../../../../types/error-data';

import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { BusinessTypeService } from '../../../../../services/opa/business-type/business-type.service';

export abstract class BusinessTypeFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild('blockIdSelection', { static: false })
  blockIdSelection: KbaFormTableSelectComponent;

  abstract isUpdate: boolean;
  checkIsEdited = false;
  isReady = false;
  screenCode: string;

  businessTypeForm = new FormGroup({
    setting: new FormControl(),
    business_type_name: new FormGroup({}),
  });
  businessTypeNameGroup: FormGroup;
  params: BusinessTypeParams = {
    business_type: {
      item_names: [],
    },
  };
  useSameName = true;
  primaryLang: string;
  originalParams: BusinessTypeParams;
  businessTypeNameParent;
  businessTypeNameRoot;
  confirmModalHeader: ModalDescItem[];
  confirmModalParams: BusinessTypeParams;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected businessTypeService: BusinessTypeService,
    protected modalService: KbaModalService,
    protected ref: ChangeDetectorRef,
    protected router: Router,
    protected alertService: KbaAlertService
  ) {
    super(navigation, title, header);
  }

  /**
   * プライマリ言語のテキストボックスに対応するモデルを取得
   * @param source 要素の取得元
   */
  getPrimaryBusinessTypeName(source): any {
    return source.item_names[0];
  }

  /**
   * その他の言語のテキストボックスに対応するモデルを取得
   * @param source 要素の取得元
   */
  getOtherBusinessTypeNames(source): any {
    return source.item_names.slice(1);
  }

  /**
   * 登録ボタン押下時の処理
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? '/business_types' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下時の処理
   */
  onClickContinue(): void {
    this._registerModalOpen('business_types/new');
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
   * 入力フォームが不正であるかを判定する
   */
  isFormInvalid() {
    return !_.every(this._formatParams().business_type.item_names, 'label');
  }

  /**
   * フォーム項目が編集済みであるかを判定する
   * @param original 元の値
   * @param current 現在の値
   */
  isEdited(original: string, current: string) {
    return this.isUpdate && original !== current;
  }

  /**
   * プライマリ言語のラベルを取得する
   * @param path リソースパス
   */
  getPrimaryLangLabel(path: string): string {
    const res = _.get(this.resource, path);
    return `${res.name} (${res.values[0].name})`;
  }

  /**
   * ブロック変更時の処理
   * @param value ブロック
   */
  async handleBlockChange(value: string) {
    const res = await this.businessTypeService.fetchBlockBelongingResource(
      value,
      this.screenCode
    );
    this.resource.business_type.item_names = res.business_type.item_names;
    this._refreshParams();
    this._rebuildFormControls();
    this.safeDetectChanges();
  }

  /**
   * 新規業種名称のフォーム部品を作成
   */
  _createBusinessTypeNamesFormGroup(reset?: boolean): FormGroup {
    const fg = new FormGroup({});
    this.resource.business_type.item_names.values.forEach((v, i) => {
      if (reset) {
        this.params.business_type.item_names[i].label = '';
      }
      const label = this.params.business_type.item_names[i].label;
      fg.addControl(v.value, new FormControl(label, Validators.required));
    });
    return fg;
  }

  /**
   * 入力内容をリセット
   */
  protected _reset(): void {
    this.alertService.close();
    this._clearError();
  }

  /**
   * コンテンツを初期化
   */
  protected _initializeContents(): void {
    this.resource.business_type.item_names.values.forEach(
      v =>
        (this.labels[v.value] = this._getLanguageLabelByCode(
          'item_names',
          v.value
        ))
    );
    this.businessTypeNameRoot = document.querySelector(
      '.business-type-name-primary'
    );
    this.businessTypeNameParent = document.getElementById(
      'KBA-text-business-type-name-primary'
    );
  }

  /**
   * フォーム部品を作成
   */
  protected _buildFormControls(): void {
    const form = this.businessTypeForm.controls.business_type_name as FormGroup;
    this.businessTypeNameGroup = this._createBusinessTypeNamesFormGroup();
    form.addControl('businessTypeName', this.businessTypeNameGroup);
    this.safeDetectChanges();
  }

  /**
   * フォーム部品の再作成
   */
  protected _rebuildFormControls(): void {
    this._buildFormControls();
    this.resource.business_type.item_names.values.forEach(
      v =>
        (this.labels[v.value] = this._getLanguageLabelByCode(
          'item_names',
          v.value
        ))
    );
  }

  /**
   * パラメータを初期化
   */
  protected _initializeParams(): void {
    this.resource.business_type.item_names.values.forEach(v => {
      if (
        this.params.business_type.item_names.find(
          attr => attr.lang_code === v.value
        ) != null
      ) {
        return;
      }
      this.params.business_type.item_names.push({
        label: '',
        lang_code: v.value,
      });
    });
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   */
  protected abstract _register(params: BusinessTypeParams): Promise<any>;

  /**
   * メッセージ内のリソースパスをリソース名に置き換える
   * @override
   * @param message メッセージ
   * @param keys エラーレスポンスのキー情報（リソースパスに対応）
   */
  protected _replacePath(message: string, keys: string[]): string {
    return keys.reduce((mesg, key) => {
      const rootPath = key.split(/\[\d+\]/)[0];
      const res = _.get(this.resource, rootPath);

      if (res) {
        let suffix = '';
        let match: RegExpMatchArray | null;
        const namesIndex =
          (match = key.match(/item_names\[(\d+)\]/)) && +match[1];

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
   * パラメータをリソースから生成する
   */
  protected _refreshParams() {
    this.params.business_type.item_names = this.resource.business_type.item_names.values.map(
      val => {
        const temp = this.params.business_type.item_names.find(
          name => name.lang_code === val.value
        );

        return (
          temp || {
            lang_code: val.value,
            label: '',
          }
        );
      }
    );
  }

  /**
   * 言語コードからラベルを取得
   * @param resourcePath 取得元となるリソースのパス
   * @param langCode 言語コード
   */
  private _getLanguageLabelByCode(resourcePath: string, langCode: string): any {
    const result = this.resource.business_type[resourcePath].values.find(
      r => r.value === langCode
    );
    return result && result.name;
  }

  /**
   * 登録モーダルオープン
   * @param path 処理後に遷移するパス
   */
  private _registerModalOpen(path?: string): void {
    const params = this._formatParams();
    const headerNames = ['use_same_name', 'item_names'];
    if (this.resource.business_type.block_id) {
      headerNames.unshift('block_id');
    }
    this.confirmModalHeader = this._buildConfimModalHeader(
      headerNames,
      this.params
    );
    this.confirmModalParams = this._buildConfimModalParams(
      this._formatParams()
    );

    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: async () => {
        try {
          await this._register(params);
          await this.router.navigateByUrl(path);
          this._reset();
          this.alertService.show(this.labels.finish_message);
        } catch (errorData) {
          this._setError(errorData, this.alertService);
        }
      },
    });
  }

  /**
   * 確認モーダルのヘッダを作成する
   * @param headerNames ヘッダの項目名
   * @param params パラメータ
   */
  private _buildConfimModalHeader(
    headerNames: string[],
    params: BusinessTypeParams
  ): any {
    return headerNames.map(name => {
      const label = (() => {
        if (name === 'use_same_name') {
          return this.labels.name_setting;
        } else {
          return _.get(this.resource.business_type, `${name}.name`);
        }
      })();
      return {
        name,
        label,
        displayable: true,
      };
    });
  }

  /**
   * 確認モーダルのパラメータを作成する
   * @param params パラメータ
   */
  private _buildConfimModalParams(params: BusinessTypeParams): any {
    const result = _.cloneDeep(params);

    if (this.resource.business_type.block_id) {
      result.business_type.block_id = this._getResourceValueName(
        'business_type.block_id',
        result.business_type.block_id
      );
    }
    result.business_type.item_names.forEach(
      type =>
        (type.lang_name = this.resource.business_type.item_names.values.find(
          v => v.value === type.lang_code
        ).name)
    );

    return result;
  }

  /**
   * パラメータを整形する
   */
  private _formatParams(): BusinessTypeParams {
    const result: BusinessTypeParams = _.cloneDeep(this.params);

    if (this.useSameName) {
      result.business_type.item_names.forEach(
        name => (name.label = result.business_type.item_names[0].label)
      );
    }

    return result;
  }
}
