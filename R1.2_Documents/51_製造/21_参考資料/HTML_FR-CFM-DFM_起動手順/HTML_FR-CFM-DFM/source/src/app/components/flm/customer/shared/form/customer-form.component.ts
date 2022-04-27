import * as _ from 'lodash';
import {
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { ModalDescItem, SearchModalValues } from '../../../../../types/common';
import { CompanyParams } from '../../../../../types/search';
import { CustomerParams } from '../../../../../types/flm/customer';

import { CommonState } from '../../../../../constants/common-state';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaCompanySearchModalComponent } from '../../../../shared/kba-company-search-modal/kba-company-search-modal.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { CustomerService } from '../../../../../services/flm/customer/customer.service';
import { UserSettingService } from '../../../../../services/api/user-setting.service';

export abstract class CustomerFormComponent extends KbaAbstractRegisterComponent {
  @ViewChildren(KbaFormTableSelectComponent)
  selectBoxes: QueryList<KbaFormTableSelectComponent>;
  @ViewChild('nationCode', { static: false })
  nationCodeSelect: KbaSelectedComponent;
  @ViewChild('businessTypeSelect', { static: false })
  businessTypeSelect: KbaSelectedComponent;
  @ViewChild('errorCloseModalContent', { static: false })
  errorCloseModalContent: TemplateRef<null>;

  screenCode: string;
  customerForm: FormGroup = new FormGroup({});

  // リクエストパラメータ
  params: CustomerParams = {
    customer: {
      identification: {
        label: '',
      },
      attribute: {
        nation_code: '',
        time_difference: '+0000',
        business_type_id: '',
        report_display_label: '',
      },
      administrator_role: {
        authorities: [],
      },
      general_role: {
        authorities: [],
      },
    },
  };

  // デフォルトパラメータ
  originalParams: CustomerParams;

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
    'customer.support_distributor_id',
    'customer.identification.label',
    'customer.identification.label_english',
    'customer.identification.organization_code',
    'customer.attribute.business_type_id',
    'customer.attribute.nation_code',
    'customer.attribute.time_difference',
    'customer.attribute.phone_no',
    'customer.attribute.email',
    'customer.attribute.address',
    'customer.attribute.report_display_label',
    'customer.administrator_role.authorities.id',
    'customer.general_role.authorities.id',
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
    protected customerService: CustomerService,
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
    const path = this.isUpdate ? '/customers' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue(): void {
    this._registerModalOpen('/customers/new');
  }

  /**
   * 入力をリセットボタン押下コールバック
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => this._reset(),
    });
  }

  /**
   * 時差プルダウン変更時の処理
   */
  onTimeDiffrenceChange(): void {
    this.params.customer.attribute.time_difference =
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
          'customer.administrator_role.authorities.id',
          'customer.general_role.authorities.id',
        ],
        pathName
      ) > -1
    );
  }

  /**
   * カスタマイズしたフォームの不正値判定
   * 登録ボタン有効判定に用いる
   */
  isInvalidCustomerForm(): boolean {
    return (
      (!this.isUpdate &&
        this.params.customer.attribute.business_type_id === '-') ||
      this.customerForm.invalid
    );
  }

  /**
   * 担当DB変更時の処理
   * @param supportDistributorId 担当DB
   */
  async handleSupportDistributorChange(supportDistributorId: string) {
    const res = await this.customerService.fetchBusinessTypeResource(
      this.screenCode,
      supportDistributorId
    );

    this.resource.customer.attribute.business_type_id =
      res.customer.attribute.business_type_id;
    this._isBusinessTypeUnregistered();
    this.resource.customer.administrator_role.authorities =
      res.customer.administrator_role.authorities;
    this.resource.customer.general_role.authorities =
      res.customer.general_role.authorities;

    if (this.businessTypeSelect) {
      await this.businessTypeSelect.refresh();
    }
    this._setDefaultAuthorities(this.resource);
  }

  /**
   * 登録処理
   * @param params 顧客登録リクエストパラメータ
   */
  protected abstract _register(params: CustomerParams);

  /**
   * 初期化完了後に行う処理
   */
  protected _afterInitialize(): void {
    if (!this.isUpdate) {
      const datePickerConfig = this.userSettingService.getDatePickerConfig();
      if (datePickerConfig && datePickerConfig.time_difference) {
        if (this.params && this.params.customer && this.params.customer.attribute) {
          this.params.customer.attribute.time_difference = datePickerConfig.time_difference;
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
   * モーダルに表示する値を整形する
   * @param paths 対象項目のパス
   */
  protected _createModalVal(paths) {
    const result = {};
    paths.forEach(path => {
      if (this.exists(path)) {
        result[path] = (() => {
          switch (path) {
            case 'customer.support_distributor_id':
            case 'customer.attribute.business_type_id':
            case 'customer.attribute.nation_code':
              return this._getResourceValueName(path, _.get(this.params, path));
            case 'customer.attribute.time_difference':
              return this.formatTimeDifference(_.get(this.params, path));
            case 'customer.administrator_role.authorities.id':
            case 'customer.general_role.authorities.id':
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
   * リソースに業種が登録されているかを判定する
   * 未登録の場合はメッセージを表示する
   */
  protected _isBusinessTypeUnregistered(): void {
    if (
      !this.isUpdate &&
      !this.exists('customer.attribute.business_type_id', true)
    ) {
      this.resource.customer.attribute.business_type_id.values = [
        { name: '-', value: '' },
      ];
      this.modalService.open({
        title: this.labels.business_type_error_modal_title,
        labels: this.labels,
        content: this.errorCloseModalContent,
      });
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
        closeBtnLabel: this.labels.cancel,
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
   * リセット処理
   */
  private _reset(): void {
    this.alertService.close();
    this._clearError();
    this.params = _.cloneDeep(this.originalParams);
    this.safeDetectChanges();
    this.customerForm.markAsPristine();
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
      time_difference: this.originalParams.customer.attribute.time_difference.slice(
        0,
        3
      ),
      time_difference_minute: this.originalParams.customer.attribute.time_difference.slice(
        3
      ),
    };
  }

  /**
   * 会社検索モーダルの OK ボタン押下時の処理
   * @param company 会社
   */
  private _updateCompanyParams(company: CompanyParams): void {
    this.params.customer.identification.label = company.identification.label;
    this.params.customer.identification.label_english =
      company.identification.label_english;
    this.params.customer.identification.organization_code =
      company.identification.organization_code;
    this.params.customer.attribute.address = company.identification.address;
    this.params.customer.attribute.nation_code =
      company.identification.nation_code;
    this.params.customer.attribute.phone_no = company.identification.phone_no;
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
      _.has(resource, 'customer.administrator_role.authorities.checked_items')
    ) {
      this.defaultAuthorities[
        'customer.administrator_role.authorities'
      ] = resource.customer.administrator_role.authorities.checked_items.values.map(
        item => item.value
      );
    }
    if (_.has(resource, 'customer.general_role.authorities.checked_items')) {
      this.defaultAuthorities[
        'customer.general_role.authorities'
      ] = resource.customer.general_role.authorities.checked_items.values.map(
        item => item.value
      );
    }
  }
}
