import * as _ from 'lodash';
import { OnInit } from '@angular/core';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
  SubgroupParams,
  AuthorityParams,
} from '../../../../types/flm/subgroup';

import { SubgroupFormComponent } from '../shared/form/subgroup-form.component';
import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SubgroupService } from '../../../../services/flm/subgroup/subgroup.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-subgroup-edit',
  templateUrl: '../shared/form/subgroup-form.component.html',
  styleUrls: ['../shared/form/subgroup-form.component.scss'],
  providers: [SubgroupService],
})
export class SubgroupEditComponent extends SubgroupFormComponent
  implements OnInit {
  isUpdate = true;
  subgroupId: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    subgroupService: SubgroupService,
    api: ApiService,
    ref: ChangeDetectorRef,
    userSettingService: UserSettingService,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header, router, alert, modal, subgroupService, api, ref, userSettingService);
  }

  protected async _fetchDataForInitialize() {
    this.activatedRoute.params.subscribe(p => (this.subgroupId = p.id));
    const res = await this.subgroupService.fetchEditInitData(this.subgroupId);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._initializeSubgroupData(res.item.result_data.sub_group);
    this._afterInitialize();
    this._setTitle();
    this.onLoad();
  }

  /**
   * 変更処理
   * @param params サブグループリクエストパラメータ
   */
  protected _register(params: SubgroupParams) {
    return this.subgroupService.updateSubgroup(this.subgroupId, params);
  }

  /**
   * 詳細取得にて得たデータから変更画面の初期パラメータを作成する
   * @param data 対象のサブグループのデータ
   */
  private _initializeSubgroupData(data) {
    this.params.sub_group.identification = _.pick(data.identification, [
      'label',
      'label_english',
      'organization_code',
      'update_datetime',
    ]);
    this.params.sub_group.attribute = _.pick(data.attribute, [
      'nation_code',
      'time_difference',
      'phone_no',
      'email',
      'address',
    ]);
    this.params.sub_group.administrator_role = {
      id: data.administrator_role.id,
      authorities: this._formatAuthorities(data.administrator_role.authorities),
    };
    this.params.sub_group.general_role = {
      id: data.general_role.id,
      authorities: this._formatAuthorities(data.general_role.authorities),
    };
  }

  /**
   * 詳細取得処理にて得た権限のデータを変更画面のパラメータに沿って整形する
   * @param authorities 権限データ
   */
  private _formatAuthorities(authorities): AuthorityParams[] {
    return authorities.map(authority => ({
      id: authority.id,
      default_kind: authority.default_kind,
    }));
  }
}
