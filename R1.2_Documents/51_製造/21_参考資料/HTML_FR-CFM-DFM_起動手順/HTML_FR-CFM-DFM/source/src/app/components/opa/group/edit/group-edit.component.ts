import { assign, pick, cloneDeep, omit, uniqBy } from 'lodash';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { GroupParams } from '../../../../types/opa/group';

import { ScreenCode } from '../../../../constants/opa/screen-codes/group-management';
import { GroupTargetKind } from '../../../../constants/opa/group-target-kind';

import { GroupFormComponent } from '../shared/form/group-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { GroupService } from '../../../../services/opa/group/group.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaMapWrapperService } from '../../../../services/shared/kba-map-wrapper.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { PublishGroupKind } from '../../../../constants/publish-group-kind';
import { ResourceValue } from '../../../../types/common';
import { PresetRolesAccordion } from '../shared/form/preset-roles-accordion';

@Component({
  selector: 'app-group-edit',
  templateUrl: '../shared/form/group-form.component.html',
  styleUrls: ['../shared/form/group-form.component.scss'],
})
export class GroupEditComponent extends GroupFormComponent {
  screenCode = ScreenCode.edit;
  isUpdate = true;
  targetKind = GroupTargetKind.groupInfo;
  groupId;
  isInitialConfigurationGroupRefresh = true;
  _super_onGroupKindChange = super.onGroupKindChange;
  _super_onSelectConfigurationGroup = super.onSelectConfigurationGroup;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    groupService: GroupService,
    ref: ChangeDetectorRef,
    modal: KbaModalService,
    router: Router,
    alert: KbaAlertService,
    map: KbaMapWrapperService,
    userSetting: UserSettingService,
    private activatedRoute: ActivatedRoute,
    api: ApiService
  ) {
    super(
      nav,
      title,
      header,
      groupService,
      ref,
      modal,
      router,
      alert,
      userSetting,
      map,
      api
    );
  }

  /**
   * グループ種別変更時の処理
   * @param groupKind グループ種別
   * @override
   */
  async onGroupKindChange(groupKind) {
    await this._super_onGroupKindChange(groupKind);

    if (this.exists('group.preset_roles.group_kind_id')) {
      const mappedResourceValues =
        this.params.group.preset_roles.map(({ group_kind_id, group_kind_name }) => {
          const found = this.resource.group.preset_roles.group_kind_id.values.find(({ value }) => value === group_kind_id);
          if (found) {
            return found;
          }

          return {
            value: group_kind_id,
            name: group_kind_name,
            notFound: true,
          };
        });

      this.resource.group.preset_roles.group_kind_id.values =
        uniqBy(mappedResourceValues.concat(this.resource.group.preset_roles.group_kind_id.values), 'value');

      this.presetRolesTable = [];
      this.resource.group.preset_roles.group_kind_id.values.forEach(
        ({ value }) => {
          let role = this.params.group.preset_roles.find(({ group_kind_id }) => group_kind_id === value);

          if (role == null) {
            role = {
              group_kind_id: value,
              authorities: [],
            };

            this.params.group.preset_roles.push(role);
          }

          this.presetRolesTable.push(new PresetRolesAccordion(role));
        }
      );

      for (const val of this.resource.group.preset_roles.group_kind_id.values) {
        if (!val.notFound) {
          await this.handleClickPresetRolesSelect(val.value);
        } else {
          console.warn('配下グループ権限のリソースが不正です');
        }
      }
    }

    if (this.params.group.identification.kind_id === PublishGroupKind.factory &&
      this.exists('group.child_plant_ids')) {
      this.childPlantIds = this.resource.group.child_plant_ids.values
        .filter((val: ResourceValue) => val.value !== this.params.group.identification.id);
    }
  }

  /**
   * 登録ボタンの有効状態を取得
   */
  isSubmitButtonEnabled() {
    if (this.template === 'groupInfo') {
      return this.isNextButtonEnabled();
    } else {
      return this.currentUser && this.currentUser.identification.id != null;
    }
  }

  /**
   * 変更対象変更時の処理
   * @param value 値
   */
  onTargetKindChange(value) {
    this._clearError();
    this.targetKind = value;
    this.resetAuthorityTable = {};
    this.isInitialConfigurationGroupRefresh = true;
    this.template =
      value === GroupTargetKind.groupInfo ? 'groupInfo' : 'keyPerson';
  }

  /**
   * 設定ブロック変更時の処理
   * @param id ブロックID
   * @override
   */
  async onSelectConfigurationGroup(id) {
    const generalAuthorities = cloneDeep(
      this.params.group.general_role.authorities
    );
    const adminAuthorities = cloneDeep(
      this.params.group.administrator_role.authorities
    );
    await this._super_onSelectConfigurationGroup(id);

    if (this.isInitialConfigurationGroupRefresh) {
      this.params.group.general_role.authorities = generalAuthorities;
      this.params.group.administrator_role.authorities = adminAuthorities;
      this.isInitialConfigurationGroupRefresh = false;
    }
  }

  protected async _fetchDataForInitialize() {
    this.activatedRoute.params.subscribe(p => (this.groupId = p.id));
    const res: any = await this.groupService.fetchEditInitData(this.groupId);
    this.initialize(res);
    this.labels = res.label;
    // グループ種別・変更対象及び共通のリソースのみ拾う
    this.resource = pick(res.resource, [
      'group.identification.kind_id',
      'target_kind',
      'X-DateFormat',
      'X-DistanceUnit',
      'X-Lang',
      'block_id',
    ]);
    this.params = this._initializeParams(res.item.result_data);
    this.mapParams =
      this._parseMapParams(this.params) ||
      this.userSettingService.getMapParams();
    this._setTitle();
    this.onLoad();
    this._afterInitialize();
    this.groupForm.addControl(
      'user_account',
      new FormControl('', Validators.required)
    );
    this.groupForm.get('user_account')
      .setValue(this.userSearchParams.user_account);

    this.safeDetectChanges();
  }

  protected _register(params: any) {
    return this.template === 'groupInfo'
      ? this.groupService.updateGroup(this.groupId, omit(params, 'group.configuration_group_id'))
      : this.groupService.updateRepresentAdministrator(this.groupId, params);
  }

  /**
   * グループ情報 をリセット
   * @override
   */
  protected _resetGroupInfo() {
    this.isInitialConfigurationGroupRefresh = true;
    super._resetGroupInfo();
  }

  /**
   * 詳細取得 API の戻り値から初期パラメータを作成する
   * @param item 対象項目
   */
  private _initializeParams(item) {
    const params: GroupParams = assign(this.params, item);
    params.group.lang_codes = item.group.langs
      ? item.group.langs.map(lang => lang.code)
      : [];
    params.group.default_lang_code = item.group.default_lang.code;
    if (item.group.rental_car_business) {
      params.group.rental_car_business_kind =
        item.group.rental_car_business.kind;
    }
    params.group.child_plant_ids = item.group.child_plants
      ? item.group.child_plants.map(plant => plant.id)
      : [];
    if (item.group.publish_target) {
      params.group.publish_target.region_ids = item.group.publish_target.regions
        ? item.group.publish_target.regions.map(region => region.id)
        : [];
    }
    this.currentUser = this.originalUser = {
      identification: {
        id: item.group.represent_administrator.user_id,
        account: item.group.represent_administrator.user_account,
        email: item.group.represent_administrator.email,
        label: item.group.represent_administrator.user_label,
      },
      attribute: {
        company_label: item.group.represent_administrator.company_label,
        nation_name: item.group.represent_administrator.nation_name,
      },
    };
    params.group.configuration_group_id = item.group.configuration_groups[0].id;
    params.group.configuration_group_label = item.group.configuration_groups[0].label;
    this.originalUserSearchParams = {
      user_account: this.originalUser.identification.account,
    };
    this.userSearchParams = cloneDeep(this.originalUserSearchParams);
    return params;
  }

  /**
   * マップ関連のパラメータをパースする
   * @param params パラメータ
   */
  private _parseMapParams(params) {
    if (
      params.group.map == null ||
      params.group.map.geometry == null ||
      params.group.map.properties == null ||
      params.group.map.geometry.coordinates == null ||
      params.group.map.properties.magnification == null
    ) {
      return null;
    }

    return {
      lat: params.group.map.geometry.coordinates[1],
      lng: params.group.map.geometry.coordinates[0],
      zoom: params.group.map.properties.magnification,
      mapApplication: '',
    };
  }
}
