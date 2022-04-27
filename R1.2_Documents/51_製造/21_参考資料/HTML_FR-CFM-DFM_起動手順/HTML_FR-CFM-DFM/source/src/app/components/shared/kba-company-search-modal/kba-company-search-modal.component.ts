import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import * as _ from 'lodash';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import {
  Labels,
  Resources,
  Fields,
  SearchModalValues,
} from '../../../types/common';

import { environment } from '../../../../environments/environment';

import { DisplayCode } from '../../../constants/display-code';

import { KbaAbstractModalContentComponent } from '../kba-abstract-component/kba-abstract-modal-content-component';

import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-kba-company-search-modal',
  templateUrl: './kba-company-search-modal.component.html',
  styleUrls: ['./kba-company-search-modal.component.scss'],
})
export class KbaCompanySearchModalComponent
  extends KbaAbstractModalContentComponent
  implements OnInit {
  labels: Labels;
  resource: Resources;
  fields: Fields;
  ok: (user) => void;
  updateModalValues: (modalValues: SearchModalValues) => void;

  params = {
    organization_code: '',
    company_label: '',
    nation_code: '',
  };
  selectedItem;
  list = [];
  isSearching = false;
  DisplayCode = DisplayCode;
  protected prefixWord = '';

  constructor(modalService: KbaModalService, private api: ApiService) {
    super(modalService);
  }

  async ngOnInit() {
    if (this.labels && this.resource && this.fields) {
      return;
    }

    [this.labels, this.resource, this.fields] = await new Promise<any[]>(
      resolve => {
        this.api.requestHandler(
          'companySearchModalInit',
          observableForkJoin(
            this.api.fetchLabels(
              environment.settings.companySearchModalScreenCode
            ),
            this.api.fetchResource(
              environment.settings.companySearchModalScreenCode
            ),
            this.api.fetchFields(
              environment.settings.companySearchModalFunctionCode
            )
          ).subscribe(res => resolve(res))
        );
      }
    );

    this.modalService.enableOk = false;
    this.updateModalValues(_.pick(this, ['labels', 'resource', 'fields']));
  }

  onClickSearch() {
    this.selectedItem = null;
    this.modalService.enableOk = false;
    this._fetchCommonAuthenticationCompanies();
  }

  /**
   * 検索結果の行押下コールバック
   * @param user ユーザ情報
   */
  onClickItem(company) {
    this.selectedItem = company;
    this.modalService.enableOk = true;
  }

  onClickClose() {
    this.modalService.close();
  }

  onClickOk() {
    this.ok(this.selectedItem);
    this.modalService.close();
  }

  /**
   * 会社一覧取得(共通認証) API を実行
   */
  private async _fetchCommonAuthenticationCompanies() {
    const res = await this.api.fetchCommonAuthenticationCompanies(this.params);
    this.list = res.result_data.companies;
    this.isSearching = true;
  }
}
