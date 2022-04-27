import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import {
  DivisionSettingSearchParams,
  DivisionSettingUpdateParams,
  DivisionSettingData,
  DivisionForUpdate,
  Division,
} from '../../../../types/opa/management-car-setting/division-setting';

import { CommonState } from '../../../../constants/common-state';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { CheckListComponent } from '../shared/check-list/check-list.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ManagementCarSettingService } from '../../../../services/opa/management-car-setting/management-car-setting.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-division-setting',
  templateUrl: './division-setting.component.html',
  styleUrls: ['./division-setting.component.scss'],
})
export class DivisionSettingComponent extends KbaAbstractRegisterComponent {
  CommonState = CommonState;

  @ViewChild('groupIDSelection', { static: false })
  groupIDSelection: KbaSelectedComponent;
  @ViewChild(CheckListComponent, { static: false })
  checkList: CheckListComponent;

  params: DivisionSettingUpdateParams;
  searchParams: DivisionSettingSearchParams = {};
  data: DivisionSettingData;
  originalData: DivisionSettingData;
  confirmData: Division[];

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    private managementCarSettingService: ManagementCarSettingService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private router: Router
  ) {
    super(navigation, title, header);
  }

  /**
   * グループ変更時の処理
   */
  onGroupIdChange() {
    this._refresh();
  }

  /**
   * 設定・続けて設定ボタンが有効であるかを返す
   */
  isSubmitButtonDisabled() {
    return (
      this.data &&
      _.isEqual(
        this.originalData.division_setting.divisions,
        this.data.division_setting.divisions
      )
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
      ok: () => this._reset(),
    });
  }

  /**
   * 登録ボタン押下時の処理
   */
  async onClickSubmit() {
    switch (await this._registerModalOpen()) {
      case 'ok':
        await this.managementCarSettingService.updateDivisionSettings(
          this.params
        );
        await this.router.navigateByUrl('/');
        this.alertService.show(this.labels.finish_message);
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
        await this.managementCarSettingService.updateDivisionSettings(
          this.params
        );
        this.alertService.show(this.labels.finish_message);
        this._reset();
        break;
      case 'close':
        break;
    }
  }

  protected async _fetchDataForInitialize() {
    const res = await this.managementCarSettingService.fetchDivisionSettingInitData();

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (!this.exists('division_setting.group_id')) {
      this._refresh();
    }
  }

  /**
   * 確認モーダルを開く
   */
  private _registerModalOpen(): Promise<'ok' | 'close'> {
    this.confirmData = this._createConfirmData(this.data);
    this.params = this._createParams(this.originalData, this.data);

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
   * 更新用のパラメータを作成する
   * @param original データ
   * @param updatedDivisions 確認モーダル用のメーカの配列
   */
  private _createParams(
    original: DivisionSettingData,
    updated: DivisionSettingData
  ) {
    return {
      division_setting: {
        update_datetime: original.division_setting.update_datetime,
        group_id: original.division_setting.group_id,
        divisions: updated.division_setting.divisions.reduce(
          (temp: Division[], division) => {
            const originalDivision = original.division_setting.divisions.find(
              _division => division.id === _division.id
            );

            if (
              originalDivision &&
              originalDivision.active_kind !== division.active_kind
            ) {
              temp.push(_.pick(division, ['code', 'active_kind']));
            }

            return temp;
          },
          []
        ),
      },
    };
  }

  /**
   * 確認モーダル用のデータを作成する
   * @param updated 変更後のデータ
   */
  private _createConfirmData(data: DivisionSettingData) {
    return data.division_setting.divisions.filter(
      division => division.active_kind === CommonState.on
    );
  }

  /**
   * データをリフレッシュする
   */
  private async _refresh() {
    this.data = (await this.managementCarSettingService.fetchDivisionSettings(
      this.searchParams
    )).result_data;
    this.originalData = _.cloneDeep(this.data);

    if (this.checkList != null) {
      this.checkList.resetScrollPosition();
    }
  }

  /**
   * 入力内容をリセットする
   */
  private _reset() {
    if (this.groupIDSelection) {
      this.groupIDSelection.reset();
    }

    this._refresh();
  }
}
