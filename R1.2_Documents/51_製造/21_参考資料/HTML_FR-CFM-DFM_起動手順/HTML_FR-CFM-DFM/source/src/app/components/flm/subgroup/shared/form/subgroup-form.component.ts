import * as _ from 'lodash';
import {
  OnInit,
  ViewChild,
  ViewChildren,
  TemplateRef,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import {
  ModalDescItem,
  ModalValues,
  SearchModalValues,
} from '../../../../../types/common';
import { CompanyParams } from '../../../../../types/search';
import {
  SubgroupParams,
  AuthorityParams,
} from '../../../../../types/flm/subgroup';

import { CommonState } from '../../../../../constants/common-state';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaAuthoritySelectComponent } from '../../../../shared/kba-authority-select/kba-authority-select.component';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaCompanySearchModalComponent } from '../../../../shared/kba-company-search-modal/kba-company-search-modal.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { SubgroupService } from '../../../../../services/flm/subgroup/subgroup.service';
import { UserSettingService } from '../../../../../services/api/user-setting.service';

export abstract class SubgroupFormComponent extends KbaAbstractRegisterComponent {
  @ViewChildren(KbaFormTableSelectComponent) selectBoxes: QueryList<
    KbaFormTableSelectComponent
  >;
  @ViewChild('nationCode', { static: false })
  nationCodeSelect: KbaSelectedComponent;

  subgroupForm: FormGroup = new FormGroup({});

  // リクエストパラメータ
  params: SubgroupParams = {
    sub_group: {
      identification: {
        label: '',
      },
      attribute: {
        nation_code: '',
        time_difference: '+0000',
      },
      administrator_role: {
        authorities: [],
      },
      general_role: {
        authorities: [],
      },
    },
  };

  // 初期化用デフォルトパラメータ
  originalParams: SubgroupParams;

  // モーダル用変数
  descItem: ModalDescItem[];
  valItem: any;

  // 時差用変数
  timeDifference: {
    time_difference: string;
    time_difference_minute: string;
  };
  companySearchModalValues: SearchModalValues = {};

  // モーダル作成時に用いるパス
  modalPaths = [
    'sub_group.identification.label',
    'sub_group.identification.label_english',
    'sub_group.identification.organization_code',
    'sub_group.attribute.nation_code',
    'sub_group.attribute.time_difference',
    'sub_group.attribute.phone_no',
    'sub_group.attribute.email',
    'sub_group.attribute.address',
    'sub_group.administrator_role.authorities.id',
    'sub_group.general_role.authorities.id',
  ];

  // 権限のラベル格納
  authorityLabels;

  // デフォルト権限格納
  defaultAuthorities = {};

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected subgroupService: SubgroupService,
    protected api: ApiService,
    protected ref: ChangeDetectorRef,
    protected userSettingService: UserSettingService
  ) {
    super(nav, title, header);
  }

  /**
   * 登録ボタン押下コールバック
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? '/subgroups' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue(): void {
    this._registerModalOpen('/subgroups/new');
  }

  /**
   * 入力をリセットボタン押下コールバック
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 時差プルダウン変更時の処理
   */
  onTimeDiffrenceChange(): void {
    this.params.sub_group.attribute.time_difference =
      this.timeDifference.time_difference +
      this.timeDifference.time_difference_minute;
  }

  /**
   * 会社検索ボタン押下時の処理
   */
  onClickCompanySearch() {
    this.modalService.customOpen(
      KbaCompanySearchModalComponent,
      {
        labels: this.companySearchModalValues.labels,
        resource: this.companySearchModalValues.resource,
        fields: this.companySearchModalValues.fields,
        updateModalValues: (modalValues: SearchModalValues) =>
          (this.companySearchModalValues = modalValues),
        ok: company => this._updateCompanyParams(company),
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 権限に対応するパラメータのモデルを取得
   * @param path パス
   * @param id 権限ID
   */
  getAuthorityModel(path, id) {
    const param = _.get(this.params, path);
    return param.find(p => p.id === id);
  }

  /**
   * 権限選択コンポーネントに渡す権限のリストを取得
   * @param path パス
   */
  getSelectedAuthorities(path) {
    const param = _.get(this.params, path);
    const authorities = (param && param.map(item => item.id)) || [];
    this.defaultAuthorities[path] = this.defaultAuthorities[path] || [];
    return _.uniq(_.concat(authorities, this.defaultAuthorities[path]));
  }

  /**
   * 権限選択時の処理
   * @param event イベント
   * @param path パラメータのパス
   */
  onSelectAuthorities(event: string[], path: string): void {
    const model = _.get(this.params, path);

    if (this.defaultAuthorities) {
      this.defaultAuthorities[path] = [];
    }

    _.set(
      this.params,
      path,
      event.map(id => {
        return (
          model.find(item => item.id === id) || {
            id,
            default_kind: CommonState.on,
          }
        );
      })
    );
  }

  /**
   * 権限のパスかどうかの判定処理
   *
   * 登録モーダルの権限部分に特殊な形を当てるため、判定を行う
   *
   * @param pathName パスの名前
   */
  isAuthority(pathName: string): boolean {
    return (
      _.indexOf(
        [
          'sub_group.administrator_role.authorities.id',
          'sub_group.general_role.authorities.id',
        ],
        pathName
      ) > -1
    );
  }

  /**
   * カスタマイズしたフォームの不正値判定
   * 登録ボタン有効判定に用いる
   */
  isInvalidSubgroupForm(): boolean {
    return this.subgroupForm.invalid;
  }

  /**
   * 登録処理
   * @param params サブグループ登録リクエストパラメータ
   */
  protected abstract _register(params: SubgroupParams);

  /**
   * 初期化完了後に行う処理
   */
  protected _afterInitialize(): void {
    if (!this.isUpdate) {
      const datePickerConfig = this.userSettingService.getDatePickerConfig();
      if (datePickerConfig && datePickerConfig.time_difference) {
        if (this.params && this.params.sub_group && this.params.sub_group.attribute) {
          this.params.sub_group.attribute.time_difference = datePickerConfig.time_difference;
        }
      }
    }
    this.originalParams = _.cloneDeep(this.params);
    this._reflectTimeDifference();
    const temp = _.cloneDeep(this.labels);
    temp.select_modal_title = this.labels.authority_select_modal_title;
    this.authorityLabels = temp;
    if (!this.isUpdate) {
      this._setDefaultAuthorities(this.resource);
    }
  }

  /**
   * 登録/変更 確認モーダルを表示する
   *
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path?: string): void {
    this.descItem = this._createModalDesc(this.modalPaths);
    this.valItem = this._createModalVal(this.modalPaths);
    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: () => {
          this._clearError();
          this._register(this.params)
            .then(async res => {
              this._reset();
              await this.router.navigateByUrl(path);
              this.alertService.show(this.labels.finish_message);
            })
            .catch(errorData => this._setError(errorData, this.alertService));
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * モーダルのヘッダを作成する
   * @param paths 対象項目のパス
   */
  private _createModalDesc(paths): ModalDescItem[] {
    return paths.map(path => ({
      label: this.exists(path)
        ? _.get(this.resource, path + '.name') || this.labels[path]
        : '',
      name: path,
      displayable: this.exists(path),
    }));
  }

  /**
   * モーダルに表示する値を整形する
   * @param paths 対象項目のパス
   */
  private _createModalVal(paths) {
    const result = {};
    paths.forEach(path => {
      if (this.exists(path)) {
        result[path] = (() => {
          switch (path) {
            case 'sub_group.attribute.business_type_id':
            case 'sub_group.attribute.nation_code':
              return this._getResourceValueName(path, _.get(this.params, path));
            case 'sub_group.attribute.time_difference':
              return this.formatTimeDifference(_.get(this.params, path));
            case 'sub_group.administrator_role.authorities.id':
            case 'sub_group.general_role.authorities.id':
              const p = path
                .split('.')
                .slice(0, 3)
                .join('.');
              return this._formatRoles(_.get(this.params, p), p);
            default:
              return _.get(this.params, path);
          }
        })();
      }
    });
    return result;
  }

  /**
   * リセット処理
   */
  private _reset(): void {
    this.alertService.close();
    this._clearError();
    this.params = _.cloneDeep(this.originalParams);
    this.safeDetectChanges();
    this.subgroupForm.markAsPristine();
    this.selectBoxes.forEach(select => select.refresh());
    this._reflectTimeDifference();
    this.refreshFormTextInput();
    if (!this.isUpdate) {
      this._setDefaultAuthorities(this.resource);
    }
  }

  /**
   * 時差のリセット処理
   */
  private _reflectTimeDifference(): void {
    this.timeDifference = {
      time_difference: this.originalParams.sub_group.attribute.time_difference.slice(
        0,
        3
      ),
      time_difference_minute: this.originalParams.sub_group.attribute.time_difference.slice(
        3
      ),
    };
  }

  /**
   * 会社検索モーダルの OK ボタン押下時の処理
   * @param company 会社
   */
  private _updateCompanyParams(company: CompanyParams): void {
    this.params.sub_group.identification.label = company.identification.label;
    this.params.sub_group.identification.label_english =
      company.identification.label_english;
    this.params.sub_group.identification.organization_code =
      company.identification.organization_code;
    this.params.sub_group.attribute.address = company.identification.address;
    this.params.sub_group.attribute.nation_code =
      company.identification.nation_code;
    this.params.sub_group.attribute.phone_no = company.identification.phone_no;
    this.safeDetectChanges();
    if (this.nationCodeSelect) {
      this.nationCodeSelect.refresh();
    }
  }

  /**
   * 権限の文言を成形して返す
   * @param roles 権限の配列
   * @param path パス
   */
  private _formatRoles(roles, path) {
    return _.sortBy(roles, 'id').map(role => {
      return [
        this._getResourceValueName(path + '.id', role.id),
        this._getResourceValueName(path + '.default_kind', role.default_kind),
      ];
    });
  }

  /**
   * デフォルトの権限をセット
   * @param resource リソース
   */
  private _setDefaultAuthorities(resource): void {
    if (
      _.has(resource, 'sub_group.administrator_role.authorities.checked_items')
    ) {
      this.defaultAuthorities[
        'sub_group.administrator_role.authorities'
      ] = resource.sub_group.administrator_role.authorities.checked_items.values.map(
        item => item.value
      );
    }
    if (_.has(resource, 'sub_group.general_role.authorities.checked_items')) {
      this.defaultAuthorities[
        'sub_group.general_role.authorities'
      ] = resource.sub_group.general_role.authorities.checked_items.values.map(
        item => item.value
      );
    }
  }
}
