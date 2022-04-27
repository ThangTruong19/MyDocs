import * as _ from 'lodash';
import {
  Component,
  Input,
  Output,
  ChangeDetectorRef,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { TableHeader } from '../../../../../types/common';

import { KbaAbstractIndexComponent } from '../../../../shared/kba-abstract-component/kba-abstract-index-component';

import { CustomerService } from '../../../../../services/flm/customer/customer.service';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent extends KbaAbstractIndexComponent {
  @Input() labels;
  @Input() resource;
  @Input() functions;
  @Input() detailHeaders: { [key: string]: string }[] = [];
  @Input() detailData;
  @Input() carListFields: { [key: string]: string }[] = [];
  @Output() clicked: EventEmitter<any> = new EventEmitter<any>();

  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  shouldDestroyNavigation = false;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private customerService: CustomerService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   */
  async fetchList(sort_key?: string) {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.customerService.fetchCarListData(
      {
        common: {
          customer: {
            ids: [this.detailData['customer.identification.id']],
          },
        },
      },
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.cars, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 戻るボタン押下時の処理
   */
  onClickBack(): void {
    this.kbaPaginationComponent.initOptions();
    this.clicked.emit();
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize() {
    this.thList = this._createThList(this.carListFields);
    const xFields = this._createXFields(this.carListFields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    const thLists = this._createThList(this.carListFields, {
      scrollable: true,
    });
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
  }
}
