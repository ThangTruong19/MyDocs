import * as _ from 'lodash';
import {
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { GroupParams } from '../../../../../types/opa/group';
import { MapParams } from '../../../../../types/user-setting';
import { SearchModalValues } from '../../../../../types/common';

import { CommonState } from '../../../../../constants/common-state';
import { GlobalKind } from '../../../../../constants/opa/global-kind';
import { SystemParamater } from '../../../../../constants/system-paramater';

import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaAreaMapComponent } from '../../../../shared/kba-area/kba-area-map.component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';
import { KbaUserSearchModalComponent } from '../../../../shared/kba-user-search-modal/kba-user-search-modal.component';
import { KbaCompanySearchModalComponent } from '../../../../shared/kba-company-search-modal/kba-company-search-modal.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { GroupService } from '../../../../../services/opa/group/group.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { KbaMapWrapperService } from '../../../../../services/shared/kba-map-wrapper.service';
import { ApiService } from '../../../../../services/api/api.service';
import { UserSettingService } from '../../../../../services/api/user-setting.service';
import { KbaAuthoritySelectComponent } from '../../../../shared/kba-authority-select/kba-authority-select.component';
import { CoordinateType } from '../../../../shared/kba-area/area';
import { PresetRolesAccordion } from './preset-roles-accordion';
import { PublishGroupKind } from '../../../../../constants/publish-group-kind';
import { WildCardCharacters } from '../../../../../constants/wild-card-characters';
import { MapApplicationMappings } from '../../../../../constants/opa/group-map-application-mappings';

export abstract class GroupFormComponent extends KbaAbstractRegisterComponent {
  @ViewChildren(KbaSelectedComponent) selections: QueryList<
    KbaSelectedComponent
  >;
  @ViewChildren(KbaFormTableSelectComponent) formSelections: QueryList<
    KbaFormTableSelectComponent
  >;
  @ViewChild('nationCode', { static: false })
  nationCodeSelect: KbaSelectedComponent;
  @ViewChild('mapModalContent', { static: false }) mapModalContent: TemplateRef<
    any
  >;
  @ViewChild(KbaAreaMapComponent, { static: false })
  areaMap: KbaAreaMapComponent;
  @ViewChild('configurationGroupSelect', { static: false })
  configurationGroupSelect: KbaFormTableSelectComponent;
  @ViewChild('mapApplicationLangCodeSelect', { static: false })
  mapApplicationLangCodeSelect: KbaSelectedComponent;

  enabledUserSearch = false;

  params: GroupParams = {
    group: {
      identification: {},
      attribute: {},
      map_application: {},
      lang_codes: [],
      publish_target: {
        region_ids: [],
      },
      child_plant_ids: [],
      administrator_role: {
        authorities: [],
      },
      general_role: {
        authorities: [],
      },
      preset_roles: [],
      map: {
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [],
        },
        type: 'Feature',
      },
    },
  };
  originalParams: GroupParams;
  state = CommonState;
  groupKind = GlobalKind;
  groupForm = new FormGroup({});
  abstract screenCode: string;
  timeDifference: {
    time_difference: string;
    time_difference_minute: string;
  };
  regionIds = [];
  childPlantIds = [];
  authorities;
  langCodes = [];
  publishTargetLabels;
  childPlantLabels;
  authorityLabels;
  langCodesLabels;
  presetRolesTable: PresetRolesAccordion[];
  template: 'groupInfo' | 'keyPerson' = 'groupInfo';
  currentUser;
  originalUser;
  groupInfoHeader: {
    label: string;
    name: string;
    displayable: boolean;
  }[];
  groupInfoParams: {
    [key: string]: any;
  };
  keyPersonHeader: {
    label: string;
    name: string;
    displayable: boolean;
  }[];
  keyPersonParams: {
    [key: string]: string;
  };
  isUpdate: boolean;
  defaultTimeDiffrence = '+0000';
  baseResource;
  defaultAuthorities = {};
  resetAuthorityTable: { [key: string]: boolean } = {};
  userSearchParams = {
    user_account: '',
  };
  originalUserSearchParams = {
    user_account: '',
  };
  isSearchedUser = false;
  userSearchModalValues: SearchModalValues = {};
  companySearchModalValues: SearchModalValues = {};
  forceCheckedLangCodes: string[] = [];

  requiredParams = [
    'group.identification.kind_id',
    'group.identification.label',
    'group.attribute.nation_code',
    'group.lang_codes',
    'group.default_lang_code',
    'group.attribute.time_difference',
    'group.map_application.id',
    'group.map_application.lang_code',
    'group.configuration_group_id',
    'group.publish_target',
  ];
  groupInfoPaths = [
    'group.identification.kind_id',
    'group.identification.label',
    'group.identification.label_english',
    'group.identification.organization_code',
    'group.attribute.phone_no',
    'group.attribute.email',
    'group.attribute.address',
    'group.attribute.nation_code',
    'group.lang_codes',
    'group.default_lang_code',
    'group.attribute.time_difference',
    'group.map_application.id',
    'group.map_application.lang_code',
    'group.map.initial_position',
    'group.attribute.first_day_of_week_kind',
    'group.rental_car_business_kind',
    'group.child_plant_ids',
    'group.configuration_group_id',
    'group.publish_target.region_ids',
    'group.administrator_role.authorities.id',
    'group.general_role.authorities.id',
    'group.preset_roles.group_kind_id',
  ];
  notIncludedEditParamKeys = [
    'group.identification.update_datetime',
    'group.administrator_role.id',
    'group.general_role.id',
    'group.preset_roles.id',
  ];
  notIncludedParamKeys = [
    'group.map.properties.magnification',
    'group.map.geometry.coordinates',
    'group.map.geometry.type',
    'group.map.type',
  ];
  keyPersonPaths = [
    'user_account',
    'key_person_name',
    'company_name',
    'nation_name',
  ];

  mapParams: MapParams;
  originalInitialMapParams;

  get formattedMapParams() {
    const result = {};

    result[SystemParamater.lat] = +this.mapParams.lat;
    result[SystemParamater.lng] = +this.mapParams.lng;
    result[SystemParamater.zoom] = +this.mapParams.zoom;

    return result;
  }

  get hasConfirmModalMap() {
    return this.exists('group.map');
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected groupService: GroupService,
    protected ref: ChangeDetectorRef,
    protected modalService: KbaModalService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected userSettingService: UserSettingService,
    private mapWrapperService: KbaMapWrapperService,
    private api: ApiService
  ) {
    super(nav, title, header);
  }

  /**
   * グループ分類変更時の処理
   * @param value グループ分類
   */
  async onGroupKindChange(groupKind) {
    let res = await this.groupService.fetchGroupKindBelongingResource(
      `${this.screenCode}`,
      groupKind
    );

    this.resource = _.pick(this.resource, ['group.identification.kind_id', 'block_id']);
    this.safeDetectChanges();

    // 不要なリソースを捨てる
    if (this.params.group.identification.kind_id !== PublishGroupKind.block) {
      res = _.omit(res, 'group.preset_roles');
    } else {
      res = _.omit(res, 'group.preset_roles.authorities');
    }

    if (
      this.params.group.identification.kind_id !==
      PublishGroupKind.globalWideAreaCustomer
    ) {
      res = _.omit(res, 'group.publish_target');
    }

    this.resource = _.merge(res, _.pick(this.resource, 'block_id'));
    this.baseResource = _.cloneDeep(this.resource);

    if (this.exists('group.publish_target.global_kind')) {
      this.params.group.publish_target = this.params.group.publish_target || {
        region_ids: [],
      };
    }

    if (this.exists('group.publish_target.region_ids')) {
      this.regionIds = this.resource.group.publish_target.region_ids.values;
    }

    if (this.exists('group.child_plant_ids')) {
      this.childPlantIds = this.resource.group.child_plant_ids.values;
    }

    if (this.exists('group.rental_car_business_kind', true)) {
      this.params.group.rental_car_business_kind =
        this.params.group.rental_car_business_kind ||
        this.resource.group.rental_car_business_kind.values[0].value;
    }

    if (this.exists('group.lang_codes')) {
      this.langCodes = this.resource.group.lang_codes.values;
    }

    if (
      this.exists('group.lang_codes_force_checked') &&
      this.resource.group.lang_codes_force_checked.values.length > 0
    ) {
      this.forceCheckedLangCodes = this.resource.group.lang_codes_force_checked.values.map(
        v => v.value
      );
      this.onSelectLangCodes({
        items: _.uniq([
          ...this.params.group.lang_codes,
          ...this.forceCheckedLangCodes,
        ]),
      });
    }

    if (this.exists('group.map.geometry.coordinates')) {
      this.resource.group.map.geometry.coordinates.lat = this.resource.group.map.geometry.coordinates[
        CoordinateType.LAT
      ];
      this.resource.group.map.geometry.coordinates.lng = this.resource.group.map.geometry.coordinates[
        CoordinateType.LNG
      ];
    }

    if (this.exists('group.preset_roles.group_kind_id')) {
      this.params.group.preset_roles = _.isEmpty(this.params.group.preset_roles)
        ? this.resource.group.preset_roles.group_kind_id.values.map(kind => ({
          group_kind_id: kind.value,
          authorities: [],
        }))
        : this.params.group.preset_roles;
      if (!this.isUpdate) {
        this.presetRolesTable = this.params.group.preset_roles.map(
          role => new PresetRolesAccordion(role)
        );
      }
    }

    if (!this.exists('block_id')) {
      this.onSelectConfigurationGroup(this.api.getGroupId());
    }

    this.safeDetectChanges();

    if (this.configurationGroupSelect) {
      await this.configurationGroupSelect.refresh();
    }

    this._resetAuthorities('groupKind');
    this._setDefaultAuthorities(this.resource);
  }

  /**
   * 配下グループのリソースパスを取得
   * @param kind 種別
   */
  getResourcePath(kind) {
    return `group.preset_roles.${kind}.authorities`;
  }

  /**
   * フォームグループを取得
   * @param path パス
   */
  getFormGroup(path) {
    return (
      this.groupForm.get(path) ||
      path
        .split('.')
        .reduce(
          (fg, p) => fg.get(p) || this._initializeFormGroup(fg, p),
          this.groupForm
        )
    );
  }

  /**
   * リージョンID選択時の処理
   * @param event イベント
   */
  onSelectRegionIds(event) {
    this.params.group.publish_target.global_kind = event.group;
    this.params.group.publish_target.region_ids = event.items;
  }

  /**
   * チャイルド工場選択時の処理
   * @param event イベント
   */
  onSelectChildPlantIds(event) {
    this.params.group.child_plant_ids = event.items;
  }

  /**
   * 言語コード選択時の処理
   * @param event イベント
   */
  async onSelectLangCodes(event) {
    this.params.group.lang_codes = event.items;
    this.params.group.default_lang_code =
      this.params.group.lang_codes.find(
        lang => lang === this.params.group.default_lang_code
      ) ||
      _.intersection(
        this.resource.group.lang_codes.values.map(v => v.value),
        this.params.group.lang_codes
      )[0];

    const res = await this.groupService.fetchMapApplicationLangResource(
      this.screenCode,
      event.items
    );
    this.resource.group.map_application.lang_code =
      res.group.map_application.lang_code;

    if (this.mapApplicationLangCodeSelect) {
      await this.mapApplicationLangCodeSelect.refresh();
    }
  }

  /**
   * 権限選択時の処理
   * @param event イベント
   * @param path パラメータのパス
   * @param presetRolesPath 配下グループ権限のリソースパス
   */
  onSelectAuthorities(
    event: string[],
    path: string,
    presetRolesPath: string | null
  ) {
    const model = _.get(this.params, path);
    const clone = _.cloneDeep(model);
    let item;

    model.length = 0;

    if (this.defaultAuthorities) {
      this.defaultAuthorities[presetRolesPath || path] = [];
    }

    event.forEach(id => {
      item = clone.find(_item => _item.id === id) || {
        id,
        default_kind: CommonState.on,
      };
      model.push(item);
    });
  }

  /**
   * ユーザ一覧(共通認証) 検索を行う
   */
  searchUserAcount(): void {
    this.alertService.close();
    const { user_account } = this.userSearchParams;

    if (_.isEmpty(user_account) || this.isSearchedUser) {
      return;
    }

    if (
      WildCardCharacters.filter(char => user_account.includes(char)).length > 0
    ) {
      this.currentUser = null;
      this.isSearchedUser = true;
      this.alertService.show(this.labels.wild_card_error, true, 'danger');
      return;
    }

    const params = {
      user_account: this.userSearchParams.user_account,
    };
    this.api
      .fetchCommonAuthenticationUsers(params)
      .then((res: any) => {
        this.currentUser = res.result_data.users[0];
        if (this.currentUser) {
          this.params.group.represent_administrator_user_id = this.currentUser.identification.id;
        } else {
          this.alertService.show(this.labels.user_not_found, true, 'danger');
        }
        this.isSearchedUser = true;
      })
      .catch(errorData => {
        this.currentUser = null;
        this.isSearchedUser = true;
        this._setError(errorData, this.alertService);
      });
  }

  /**
   * ユーザID入力後 Enter 押下時コールバック
   */
  onEnterUserAccount(): void {
    this.searchUserAcount();
  }

  /**
   * ユーザID入力後フォーカスアウト時コールバック
   */
  onBlurUserAccount() {
    this.searchUserAcount();
  }

  /**
   * ユーザID変更時コールバック
   */
  onChangeUserAcount(): void {
    this.currentUser = null;
    this.params.group.represent_administrator_user_id = null;
    this.isSearchedUser = false;
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
    const authorities =
      (param && param.map(item => (item && item.id) || null).filter(Boolean)) ||
      [];
    return authorities;
  }

  /**
   * アコーディオンの高さを返す
   * @param i インデックス
   */
  getAccordionHeight(i) {
    if (this.presetRolesTable == null) {
      return '0px';
    }

    return this.presetRolesTable[i].isOpened
      ? this.presetRolesTable[i].height
      : '0px';
  }

  /**
   * アコーディオンの開閉状態を切り替える
   * @param i インデックス
   */
  toggleAccodtion(i) {
    if (this.presetRolesTable == null) {
      return;
    }

    const state = this.presetRolesTable[i].isOpened;
    this.presetRolesTable.forEach(item => (item.isOpened = false));
    this.presetRolesTable[i].isOpened = !state;
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
   * ユーザ検索ボタン押下時の処理
   */
  onClickUserSearch() {
    this.modalService.customOpen(
      KbaUserSearchModalComponent,
      {
        labels: this.userSearchModalValues.labels,
        resource: this.userSearchModalValues.resource,
        fields: this.userSearchModalValues.fields,
        updateModalValues: (modalValues: SearchModalValues) =>
          (this.userSearchModalValues = modalValues),
        ok: user => {
          this.currentUser = user;
          this.userSearchParams.user_account = this.currentUser.identification.account;
          this.params.group.represent_administrator_user_id = this.currentUser.identification.id;
          this.alertService.close();
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 次へボタン押下時の処理
   */
  onClickNext() {
    this.template = 'keyPerson';
  }

  /**
   * 戻るボタン押下時の処理
   */
  onClickBack() {
    this.template = 'groupInfo';
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
   * 登録ボタン押下時の処理
   */
  onClickSubmit() {
    const path = this.isUpdate ? '/groups' : '/';
    this._registerModalOpen(path, true);
  }

  /**
   * 登録ボタン押下時の処理
   */
  onClickContinue() {
    this._registerModalOpen('/groups/new', false);
  }

  /**
   * 次へボタンが有効であるかを判定
   */
  isNextButtonEnabled() {
    return this.requiredParams.every(path => {
      switch (path) {
        case 'group.publish_target':
          return (
            !this.exists(path) ||
            (this.exists(path) &&
              (this.params.group.publish_target.global_kind ===
                this.groupKind.global ||
                this.params.group.publish_target.region_ids.length > 0))
          );
        case 'group.preset_roles':
          return (
            !this.exists(path) ||
            (this.exists(path) &&
              this.params.group.preset_roles.every(
                role => role.authorities.length > 0
              ))
          );
        case 'group.configuration_group_id':
          return !this.exists('block_id') || this.checkisValid('group.configuration_group_id');
        default:
          return this.checkisValid(path);
      }
    });
  }

  /**
   * パラメータが有効なものであるかチェック
   * @param path パス
   */
  checkisValid(path) {
    return (
      !this.exists(path) ||
      (this.exists(path) && !_.isEmpty(_.get(this.params, path)))
    );
  }

  /**
   * 時差プルダウン変更時の処理
   * @param elem 時 / 分
   * @param value 値
   */
  onTimeDiffrenceChange() {
    this.params.group.attribute.time_difference =
      this.timeDifference.time_difference +
      this.timeDifference.time_difference_minute;
  }

  /**
   * 初期位置を設定ボタン押下時の処理
   */
  onClickMapPositionButton() {
    this.mapWrapperService.refreshMapConfig(
      +MapApplicationMappings[this.params.group.map_application.id]
    );

    this.modalService.open(
      {
        title: this.labels.map_modal_title,
        labels: this.labels,
        content: this.mapModalContent,
        okBtnLabel: this.labels.map_modal_ok,
        ok: () => this._updateInitialMapParams(),
      },
      {
        size: 'xl',
        windowClass: 'map-modal',
      }
    );
  }

  /**
   * パラメータの種別を取得
   * @param value パラメータの値
   */
  getParamType(value) {
    let depth = 0;
    let temp = value;

    if (_.isArray(value) && _.isPlainObject(value[0])) {
      return 'object';
    }

    while (_.isArray(temp)) {
      temp = temp[0];
      depth++;
    }

    return ['string', 'list', 'table'][depth];
  }

  /**
   * 地図アプリ変更時の処理
   * @param id 地図アプリ ID
   */
  onChangeMapApplication(id) {
    this.params.group.map_application.id = id;
    this.mapParams = _.cloneDeep(this.originalInitialMapParams);
    this.mapParams.mapApplication = id;
  }

  /**
   * レンタル車両業務変更時の処理
   * @param value レンタル車両業務値
   */
  onChangeRentalCarBusinessKind(value) {
    this.params.group.rental_car_business_kind = value;
  }

  /**
   * Block 配下権限の件数を取得
   * @param index インデックス
   */
  getPresetRolesCount(index) {
    const authorities = _.get(
      this.params,
      `group.preset_roles[${index}].authorities`
    );
    return authorities && authorities.length;
  }

  /**
   * 設定ブロック変更時の処理
   * @param id ブロックID
   */
  async onSelectConfigurationGroup(id) {
    const groupKind = this.params.group.identification.kind_id;
    const res = await this.groupService.fetchBlockBelongingAuthorityResource(
      this.screenCode,
      id,
      groupKind
    );
    this.resource.group.administrator_role = res.group.administrator_role;
    this.resource.group.general_role = res.group.general_role;

    this._resetAuthorities('groupKind');
    this._setDefaultAuthorities(this.resource);
  }

  /**
   * 所属国変更時の処理
   * @param nationCode 所属国
   */
  async onSelectNationCode(nationCode) {
    const res = await this.groupService.fetchMapApplicationResource(
      this.screenCode,
      nationCode
    );
    this.resource.group.map_application.id.values =
      res.group.map_application.id.values;
    this.params.group.map_application.id = this.resource.group.map_application.id.values.find(
      val => val.value === this.params.group.map_application.id
    )
      ? this.params.group.map_application.id
      : this.resource.group.map_application.id.values[0].value;
  }

  /**
   * 配下グループの権限の選択ボタン押下時の処理
   * @param kind 配下グループの種別
   * @param authoritiySelect 権限選択コンポーネント
   */
  async handleClickPresetRolesSelect(
    kind,
    authoritiySelect?: KbaAuthoritySelectComponent
  ) {
    const res = await this.groupService.fetchPresetRolesResource(
      this.screenCode,
      kind,
      !this.isUpdate
    );
    this.resource.group.preset_roles[kind] = res.group.preset_roles;

    this.safeDetectChanges();
    this._setDefaultPresetRolesAuthorities(kind);

    if (authoritiySelect) {
      this.safeDetectChanges();
      authoritiySelect.onClickSelect();
    }
  }

  /**
   * 登録ボタンの有効状態を取得
   */
  abstract isSubmitButtonEnabled();

  protected abstract _fetchDataForInitialize();

  /**
   * 初期化完了後に行う処理
   */
  protected _afterInitialize() {
    this.groupForm = new FormGroup({});
    this.originalParams = _.cloneDeep(this.params);
    this._reflectTimeDifference(this.params.group.attribute.time_difference);
    this.mapParams.mapApplication = this.params.group.map_application.id;
    this.originalInitialMapParams = _.cloneDeep(this.mapParams);

    let temp;
    temp = _.cloneDeep(this.labels);
    temp.select_modal_title = this.labels.pub_target_modal_title;
    this.publishTargetLabels = temp;

    temp = _.cloneDeep(this.labels);
    temp.select_modal_title = this.labels.child_plant_modal_title;
    this.childPlantLabels = temp;

    temp = _.cloneDeep(this.labels);
    temp.select_modal_title = this.labels.authority_select_modal_title;
    this.authorityLabels = temp;

    temp = _.cloneDeep(this.labels);
    temp.select_modal_title = this.labels.lang_codes_modal_title;
    this.langCodesLabels = temp;

    this.groupForm.addControl(
      'user_account',
      new FormControl('', Validators.required)
    );
  }

  protected abstract _register(params);

  /**
   * グループ情報をリセット
   */
  protected _resetGroupInfo() {
    this.template = 'groupInfo';
    this.params = _.cloneDeep(this.originalParams);
    this.mapParams = _.cloneDeep(this.originalInitialMapParams);
    this._reflectTimeDifference(this.params.group.attribute.time_difference);
    this.safeDetectChanges();
    this.groupForm.markAsPristine();
    this.params.group.identification.kind_id =
      this.params.group.identification.kind_id ||
      this.resource.group.identification.kind_id.values[0].value;
    this.onGroupKindChange(this.params.group.identification.kind_id);
  }

  /**
   * フォームグループを初期化
   * @param fg フォームグループ
   * @param path パス
   */
  private _initializeFormGroup(fg: FormGroup, path: string) {
    fg.addControl(path, new FormGroup({}));
    return fg.get(path);
  }

  /**
   * 会社検索モーダルの OK ボタン押下時の処理
   * @param company 会社
   */
  private _updateCompanyParams(company) {
    this.params.group.identification.label = company.identification.label;
    this.params.group.identification.label_english =
      company.identification.label_english;
    this.params.group.identification.organization_code =
      company.identification.organization_code;
    this.params.group.attribute.address = company.identification.address;
    this.params.group.attribute.nation_code =
      company.identification.nation_code;
    this.params.group.attribute.phone_no = company.identification.phone_no;
    this.safeDetectChanges();
    if (this.nationCodeSelect) {
      this.nationCodeSelect.refresh();
    }
  }

  /**
   * リセット処理
   * @param hard 完全なリセットを行う
   */
  private _reset(hard = false) {
    this.alertService.close();
    this.errorData = null;
    this.resetAuthorityTable = {};
    if (hard) {
      this._resetGroupInfo();
      this._resetKeyPerson();
      this.template = 'groupInfo';
    } else {
      switch (this.template) {
        case 'groupInfo':
          this._resetGroupInfo();
          break;
        case 'keyPerson':
          this._resetKeyPerson();
          break;
      }
    }
  }

  /**
   * KeyPerson をリセット
   */
  private _resetKeyPerson() {
    this.template = 'keyPerson';
    this.currentUser = _.cloneDeep(this.originalUser);
    this.userSearchParams = _.cloneDeep(this.originalUserSearchParams);
    const control = this.groupForm.get('user_account');
    control.markAsPristine();
    control.setValue(this.userSearchParams.user_account);
    this.isSearchedUser = false;
  }

  /**
   * 登録モーダルのヘッダを作成する
   * @param paths 対象となる項目のパス
   */
  private _createSubmitModalHeader(paths) {
    return paths.map(path => {
      let displayable = this.exists(path) || this.keyPersonPaths.indexOf(path) > -1;

      if (path === 'group.configuration_group_id') {
        displayable = this.exists('block_id') && this.exists('group.configuration_group_id');
      }

      return {
        label: displayable
          ? _.get(this.resource, path + '.name') || this.labels[path]
          : '',
        name: path,
        displayable,
      };
    });
  }

  /**
   * 登録モーダルのパラメータを整形する
   * @param paths 対象となる項目のパス
   */
  private _createSubmitModalParams(paths) {
    const result = {};
    paths.forEach(path => {
      if (this.exists(path) || this.keyPersonPaths.indexOf(path) > -1) {
        result[path] = (() => {
          switch (path) {
            case 'group.identification.kind_id':
            case 'group.attribute.nation_code':
            case 'group.configuration_group_id':
            case 'group.map_application.id':
            case 'group.map_application.lang_code':
            case 'group.default_lang_code':
            case 'group.attribute.first_day_of_week_kind':
            case 'group.rental_car_business_kind':
              return this._getResourceValueName(path, _.get(this.params, path));
            case 'group.attribute.time_difference':
              return this.formatTimeDifference(_.get(this.params, path));
            case 'group.publish_target.region_ids':
              return this._formatPublishTarget(this.params);
            case 'group.child_plant_ids':
            case 'group.lang_codes':
              return this._formatArrayLikeItems(_.get(this.params, path), path);
            case 'group.administrator_role.authorities.id':
            case 'group.general_role.authorities.id':
              const p = path
                .split('.')
                .slice(0, 3)
                .join('.');
              return this._formatRoles(_.get(this.params, p), p);
            case 'group.preset_roles.group_kind_id':
              return this._formatPresetRoles(
                _.get(this.params, 'group.preset_roles')
              );
            case 'group.map.initial_position':
              return this.mapParams;
            case 'user_account':
              return this.currentUser.identification.account;
            case 'key_person_name':
              return this.currentUser.identification.label;
            case 'company_name':
              return this.currentUser.attribute.company_label;
            case 'nation_name':
              return this.currentUser.attribute.nation_name;
            default:
              return _.get(this.params, path);
          }
        })();
      }
    });

    return result;
  }

  /**
   * 確認モーダルを開く
   * @param path 遷移後パス
   * @param transition 画面遷移有無
   */
  private _registerModalOpen(path: string, transition: boolean) {
    this.groupInfoParams = this.keyPersonParams = null;

    if (!this.isUpdate || this.template === 'groupInfo') {
      this.groupInfoHeader = this._createSubmitModalHeader(this.groupInfoPaths);
      this.groupInfoParams = this._createSubmitModalParams(this.groupInfoPaths);
    }

    if (!this.isUpdate || this.template === 'keyPerson') {
      this.keyPersonHeader = this._createSubmitModalHeader(this.keyPersonPaths);
      this.keyPersonParams = this._createSubmitModalParams(this.keyPersonPaths);
    }

    if (this.exists('group.map_application.id', true)) {
      this.mapParams.mapApplication =
        MapApplicationMappings[this.params.group.map_application.id];
    }

    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: async () => {
          const params = this._formatParams(this.params, this.currentUser) as GroupParams;
          params.group.child_plant_ids =
            _.isArray(params.group.child_plant_ids) && params.group.child_plant_ids.length > 0 ? params.group.child_plant_ids : null;
          this._clearError();
          this._showLoadingSpinner();
          await this._register(params).catch(errorData =>
            this._setError(errorData, this.alertService)
          );

          if (!transition) {
            this._reset(true);
          }
          await this.router.navigateByUrl(path);
          this._hideLoadingSpinner();
          this.alertService.show(this.labels.complete_message);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 公開先の文言を成形して返す
   * @param params パラメータ
   */
  private _formatPublishTarget(params) {
    const model = _.get(params, 'group.publish_target');
    const result = [];
    const globalKind = this._getResourceValueName(
      'group.publish_target.global_kind',
      model.global_kind
    );
    result.push(globalKind);

    if (model.global_kind === this.groupKind.region) {
      result.push(
        model.region_ids
          .map(id =>
            this._getResourceValueName('group.publish_target.region_ids', id)
          )
          .join(', ')
      );
    }

    return result;
  }

  /**
   * グループ選択モーダルで選択する項目の文言を成形して返す
   * @param items 項目の配列
   * @param path パス
   */
  private _formatArrayLikeItems(items, path) {
    return items.map(id => this._getResourceValueName(path, id)).join(', ');
  }

  /**
   * 権限の文言を成形して返す
   * @param roles 権限の配列
   * @param path パス
   */
  private _formatRoles(roles, path) {
    return roles.map(role => [
      this._getResourceValueName(path + '.id', role.id),
      this._getResourceValueName(path + '.default_kind', role.default_kind),
    ]);
  }

  /**
   * 配下グループの権限を成形して返す
   * @param roles 権限の配列
   */
  private _formatPresetRoles(roles) {
    return roles.map(role => ({
      label: this._getResourceValueName(
        'group.preset_roles.group_kind_id',
        role.group_kind_id
      ),
      roles: this._formatRoles(
        role.authorities,
        `group.preset_roles.${role.group_kind_id}.authorities`
      ),
    }));
  }

  /**
   * パラメータから必要な値のみを取り出す
   * @param params パラメータ
   * @param keyPerson 選択されたユーザ
   */
  private _formatParams(params, keyPerson) {
    if (!this.isUpdate || this.template === 'groupInfo') {
      let temp: GroupParams = _.cloneDeep(params);

      const filterParams = (p, _key = null) => {
        let key;
        _.keys(p).forEach(k => {
          key = _key ? [_key, k].join('.') : k;

          if (this.exists(key) && _.isPlainObject(p[k])) {
            return filterParams(p[k], key);
          }

          this._formatAuthorities(temp, key);
          this._formatMapParams(temp, key);

          if (
            (this.exists(key) && !this._extraExcludedParams(temp, key)) ||
            this._extraIncludedParams(key)
          ) {
            return;
          }

          temp = _.omit(temp, key);
        });

        return temp;
      };

      const formatted = filterParams(temp);

      if (!this.exists('block_id')) {
        formatted.group.configuration_group_id = this.api.getGroupId();
      }

      if (!this.isUpdate) {
        formatted.group.represent_administrator_user_id =
          keyPerson.identification.id;
      }

      return formatted;
    }

    return {
      group: {
        represent_administrator_user_id: keyPerson.identification.id,
        update_datetime: params.group.identification.update_datetime,
      },
    };
  }

  /**
   * リソースに含まれないがパラメータに含める項目を判定する
   * @param key キー名
   */
  private _extraIncludedParams(key) {
    const bool = this.notIncludedParamKeys.indexOf(key) > -1;
    if (!this.isUpdate) {
      return bool || key === 'group.represent_administrator_user_id';
    }
    return bool || this.notIncludedEditParamKeys.indexOf(key) > -1;
  }

  /**
   * リソースに含まれるがパラメータに含めない項目を判定する
   * @param params パラメータ
   * @param key キー名
   */
  private _extraExcludedParams(params, key) {
    switch (key) {
      case 'group.publish_target.region_ids':
        return params.group.publish_target.global_kind === this.groupKind.global;

      case 'block_id':
        return true;

      default:
        return false;
    }
  }

  /**
   * 時差のパラメータを解釈しプルダウンに反映する
   * @param diff 時差（文字列形式）
   */
  private _reflectTimeDifference(diff) {
    diff = diff || this.defaultTimeDiffrence;
    this.timeDifference = {
      time_difference: diff.slice(0, 3),
      time_difference_minute: diff.slice(3),
    };
  }

  /**
   * マップ初期位置のパラメータを更新
   */
  private _updateInitialMapParams() {
    const pos = this.areaMap.mr.getCenter();
    const zoom = this.areaMap.mr.getZoom();
    const app = this.mapParams.mapApplication;

    this.mapParams = {
      lat: `${_.floor(pos.lat % 90, 8)}`,
      lng: `${_.floor(pos.lng % 180, 8)}`,
      zoom: zoom,
      mapApplication: app,
    };
  }

  /**
   * 権限のパラメータを成型する
   * @param params パラメータ
   * @param key キー
   */
  private _formatAuthorities(params, key) {
    const target = _.get(params, key);

    if (
      [
        'group.administrator_role.authorities',
        'group.general_role.authorities',
        'group.preset_roles',
      ].indexOf(key) < 0
    ) {
      return;
    }

    const unsetNotUsedParts = role => {
      _.unset(role, 'default_kind_name');
      _.unset(role, 'name');
    };

    if (key === 'group.preset_roles') {
      target.forEach(t =>
        t.authorities.forEach(role => unsetNotUsedParts(role))
      );
    } else {
      target.forEach(role => unsetNotUsedParts(role));
    }
  }

  /**
   * 地図のパラメータを成型する
   * @param params パラメータ
   * @param key キー
   */
  private _formatMapParams(params, key) {
    if (
      !/^group\.map\.geometry/.test(key) &&
      !/^group\.map\.properties/.test(key)
    ) {
      return;
    }

    params.group.map.geometry.coordinates = [
      this.mapParams.lng,
      this.mapParams.lat,
    ];
    params.group.map.properties.magnification = this.mapParams.zoom;
  }

  /**
   * デフォルトの権限をセット
   * @param resource リソース
   */
  private _setDefaultAuthorities(resource): void {
    if (_.has(resource, 'group.administrator_role.authorities.checked_items')) {
      this.defaultAuthorities[
        'group.administrator_role.authorities'
      ] = resource.group.administrator_role.authorities.checked_items.values.map(
        item => item.value
      );
    }
    if (_.has(resource, 'group.general_role.authorities.checked_items')) {
      this.defaultAuthorities[
        'group.general_role.authorities'
      ] = resource.group.general_role.authorities.checked_items.values.map(
        item => item.value
      );
    }
  }

  /**
   * 配下グループのデフォルト権限を設定する
   * @param kind 配下グループの種別
   */
  private _setDefaultPresetRolesAuthorities(kind) {
    const presetRoles = this.resource.group.preset_roles;
    if (presetRoles == null) {
      return;
    }

    const checkedItems = _.get(
      presetRoles,
      `${kind}.authorities.checked_items`
    );

    this.defaultAuthorities[
      `group.preset_roles.${kind}.authorities`
    ] = checkedItems ? checkedItems.values.map(item => item.value) : [];
  }

  /**
   * 配下グループを除く権限をリセット
   */
  private _resetAuthorities(key) {
    this.resetAuthorityTable = this.resetAuthorityTable || {};
    if (!this.resetAuthorityTable[key]) {
      this.resetAuthorityTable[key] = true;
      return;
    }
    this.params.group.administrator_role.authorities = [];
    this.params.group.general_role.authorities = [];
  }
}
