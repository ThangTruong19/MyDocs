import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';

import {
  Labels,
  Resources,
  Fields,
  SearchModalValues,
} from '../../../types/common';

import { environment } from '../../../../environments/environment';

import { DisplayCode } from '../../../constants/display-code';

import { KbaAbstractModalContentWithPaginationComponent } from '../kba-abstract-component/kba-abstract-modal-content-with-pagination';

import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { ApiService } from '../../../services/api/api.service';

interface UserSearchParams {
  user_account?: string;
  user_label?: string;
  company_label?: string;
  nation_code?: string;
}

@Component({
  selector: 'app-kba-user-search-modal',
  templateUrl: './kba-user-search-modal.component.html',
  styleUrls: ['./kba-user-search-modal.component.scss'],
})
export class KbaUserSearchModalComponent
  extends KbaAbstractModalContentWithPaginationComponent
  implements OnInit {
  labels: Labels;
  resource: Resources;
  fields: Fields;
  ok: (user) => void;
  updateModalValues: (modalValues: SearchModalValues) => void;

  // Edgeのバグ対策用
  _super_onClickSearch = super.onClickSearch;

  params: UserSearchParams = {
    user_account: '',
    user_label: '',
    company_label: '',
    nation_code: '',
  };
  selectedUser;
  userList = [];
  DisplayCode = DisplayCode;
  protected prefixWord = /^users\./;

  constructor(
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private api: ApiService
  ) {
    super(modalService, ref);
  }

  /**
   * 初期処理
   */
  async initialize() {
    if (!this.labels || !this.resource || !this.fields) {
      [this.labels, this.resource, this.fields] = await new Promise<any[]>(
        resolve => {
          this.api.requestHandler(
            'userSearchModalInit',
            observableForkJoin(
              this.api.fetchLabels(
                environment.settings.userSearchModalScreenCode
              ),
              this.api.fetchResource(
                environment.settings.userSearchModalScreenCode
              ),
              this.api.fetchFields(
                environment.settings.userSearchModalFunctionCode
              )
            ).subscribe(res => resolve(res))
          );
        }
      );

      this.modalService.enableOk = false;
      this.updateModalValues(_.pick(this, ['labels', 'resource', 'fields']));
    }

    this.ref.detectChanges();
    this.onClickSearch();
  }

  /**
   * テーブルに表示するデータを取得
   */
  fetchList() {
    return new Promise(resolve => {
      this.isSearching = true;

      const opt = {
        cache: false,
        request_header: this.requestHeaderParams,
      };

      this.api
        .fetchCommonAuthenticationUsers(this.params, opt)
        .then((response: any) => {
          this.userList = _.cloneDeep(response.result_data.users);
          this._buildOptions(response.result_header);

          this.isSearching = false;
          this._afterFetchList();
          resolve();
        });
    });
  }

  async onClickSearch() {
    this._super_onClickSearch();
    await this.fetchList();
    this.selectedUser = null;
    this.modalService.enableOk = false;
  }

  /**
   * 検索結果の行押下コールバック
   * @param user ユーザ情報
   */
  onClickUser(user) {
    this.selectedUser = user;
    this.modalService.enableOk = true;
  }

  onClickClose() {
    this.modalService.close();
  }

  onClickOk() {
    this.ok(this.selectedUser);
    this.modalService.close();
  }
}
