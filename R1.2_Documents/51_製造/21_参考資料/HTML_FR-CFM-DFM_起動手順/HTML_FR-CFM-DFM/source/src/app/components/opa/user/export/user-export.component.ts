import { Title } from '@angular/platform-browser';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Fields } from '../../../../types/common';
import { UserCountParams } from '../../../../types/opa/user';

import { ProcessingType } from '../../../../constants/download';
import { KbaMimeType } from '../../../../constants/mime-types';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserService } from '../../../../services/opa/user/user.service';

@Component({
  selector: 'app-user-export',
  templateUrl: './user-export.component.html',
  styleUrls: ['./user-export.component.scss'],
})
export class UserExportComponent extends KbaAbstractIndexComponent {
  params: UserCountParams = {
    group_id: '',
  };
  userForm: FormGroup = new FormGroup({});
  blockLinks: object[] = [];
  resultData: object[] = [];
  downloadFields: Fields;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    private userService: UserService,
    private api: ApiService,
    protected modalService: KbaModalService,
    private alertService: KbaAlertService
  ) {
    super(navigationService, title, router, ref, header);
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList() {
    const res = await this.userService.fetchExportIndexList(this.params);
    this._fillLists(res.result_header, res.result_data.groups);
  }

  /**
   * Excel出力ボタン押下時コールバック
   */
  async onClickExport() {
    this._showLoadingSpinner();
    this._reflectXFields(this.downloadFields);
    try {
      const res = await this.userService.createFile(
        {
          configuration_group_id: this.params.group_id,
          file_content_type: KbaMimeType.excel,
          processing_type: ProcessingType.sync,
        },
        {
          ...this.requestHeaderParams,
          'X-Sort': 'users.identification.account',
        }
      );

      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * グループID変更時の処理
   * @param value 選択値
   */
  onGroupIdChange(value) {
    this.blockLinks.length = 0;
    this.resultData.length = 0;
    this.fetchList();
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize() {
    const res = await this.userService.fetchInitExport();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.downloadFields = res.downloadFields;
  }

  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  protected _fillLists(resultHeader: any, resultData: any) {
    _.chain(resultData)
      .orderBy(['identification.id'], ['asc'])
      .each(data => {
        const blockInfo = {
          id: _.get(data, 'identification.id'),
          label: _.get(data, 'identification.label'),
        };
        this.blockLinks.push(blockInfo);

        const userCount = _.get(data, 'user_count');
        _.set(userCount, 'total', {
          count: _.chain(userCount)
            .map('count')
            .sum()
            .value(),
          name: this.labels.total,
        });
        this.resultData.push(_.merge(blockInfo, userCount));
      })
      .value();
  }
}
