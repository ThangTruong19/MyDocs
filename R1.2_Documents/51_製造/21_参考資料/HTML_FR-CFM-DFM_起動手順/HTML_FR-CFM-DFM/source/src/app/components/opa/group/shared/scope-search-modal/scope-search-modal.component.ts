import * as _ from 'lodash';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { Api } from '../../../../../types/common';

import { ScopeGroupKind } from '../../../../../constants/opa/scope-group-kind';
import { PublishGroupKind } from '../../../../../constants/publish-group-kind';

import { KbaAbstractModalContentWithPaginationComponent } from '../../../../shared/kba-abstract-component/kba-abstract-modal-content-with-pagination';

import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { GroupService } from '../../../../../services/opa/group/group.service';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';

@Component({
  selector: 'app-scope-search-modal',
  templateUrl: './scope-search-modal.component.html',
  styleUrls: ['./scope-search-modal.component.scss'],
})
export class ScopeSearchModalComponent extends KbaAbstractModalContentWithPaginationComponent {
  @Input() labels;
  @Input() resource;
  @Input() groupId;
  @Input() modalValues;
  @Input() fetchScope: (id, params, requestHeaderParams) => Promise<Api>;
  @Input() checkIdKey;
  @Input() groupKindId;
  @Output() checked: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('distributorSelect', { static: false })
  distributorSelect: KbaSelectedComponent;

  PublishGroupKind = PublishGroupKind;
  tempAdditionalItems = [];
  tempRemovalItems = [];

  selectedItem = '';
  list = [];
  checkStates: { [key: string]: boolean } = {};
  _super_onClickSearch = super.onClickSearch;

  protected prefixWord = '';

  @Input() set additionalItems(items) {
    items.forEach(item => this.updateCheckState(item, true));
    this.tempAdditionalItems = items;
    this.updateState();
  }

  @Input() set removalItems(items) {
    items.forEach(item => this.updateCheckState(item, false));
    this.tempRemovalItems = items;
    this.updateState();
  }

  get additionalItems() {
    return _.uniqBy(
      this.list.concat(this.tempAdditionalItems),
      this.checkIdKey
    ).filter(
      item => item.kind === ScopeGroupKind.notSet && this.getCheckState(item)
    );
  }

  get removalItems() {
    return _.uniqBy(
      this.list.concat(this.tempRemovalItems),
      this.checkIdKey
    ).filter(
      item => item.kind === ScopeGroupKind.set && !this.getCheckState(item)
    );
  }

  get checkAll() {
    return this.list.every(item => this.getCheckState(item));
  }

  set checkAll(value) {
    this.list.forEach(item => this.updateCheckState(item, value));
    this.updateState();
  }

  constructor(
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private groupService: GroupService
  ) {
    super(modalService, ref);
  }

  /**
   * 初期処理
   */
  initialize() {
    this.onClickSearch();
  }

  /**
   * テーブルに表示するデータを取得
   */
  fetchList() {
    return new Promise(resolve => {
      this.isSearching = true;
      const requestHeaderParams = _.merge(
        this.modalValues.requestHeaderParams,
        this.requestHeaderParams
      );

      this.fetchScope(this.groupId, this.params, requestHeaderParams).then(
        (response: any) => {
          this.list = _.cloneDeep(response.result_data.group.scope_groups);
          this._buildOptions(response.result_header);

          this.list.forEach(item => {
            this.updateCheckState(
              item,
              this.getCheckState(item) != null
                ? this.getCheckState(item)
                : item.kind === ScopeGroupKind.set
            );
          });

          this.updateState();
          this.isSearching = false;
          this._afterFetchList();
          resolve();
        }
      );
    });
  }

  /**
   * 行に対応するクラスを取得
   * @param item 項目
   * @param index インデックス
   */
  getRowClass(item) {
    if (item.kind === ScopeGroupKind.set && !this.getCheckState(item)) {
      return 'row-remove';
    }

    if (item.kind === ScopeGroupKind.notSet && this.getCheckState(item)) {
      return 'row-add';
    }

    return '';
  }

  /**
   * 項目の識別情報を取得
   * @param item 項目
   */
  getItemId(item) {
    return _.get(item, this.checkIdKey);
  }

  /**
   * 対象項目のチェック状態を取得
   * @param item 項目
   */
  getCheckState(item) {
    return this.checkStates[this.getItemId(item)];
  }

  updateCheckState(item, value) {
    this.checkStates[this.getItemId(item)] = value;
  }

  /**
   * 検索ボタン押下時の処理
   */
  async onClickSearch() {
    this._super_onClickSearch();
    await this.fetchList();
    this.list.forEach(item => {
      this.updateCheckState(item, item.kind === ScopeGroupKind.set);
    });
    this.updateState();
  }

  /**
   * チェックボックスの更新を反映する
   */
  updateState() {
    this.tempAdditionalItems = this.additionalItems;
    this.tempRemovalItems = this.removalItems;

    this.modalService.enableOk =
      this.list.length > 0 &&
      (this.additionalItems.length > 0 || this.removalItems.length > 0);
    this.checked.emit({
      added: this.additionalItems,
      removed: this.removalItems,
    });
  }

  /**
   * ブロックID変更時の処理
   * @param blockId ブロックID
   */
  async handleBlockIdChange(blockId: string) {
    if (_.get(this.resource, 'distributor_id') == null) {
      return;
    }

    const res = await this.groupService.fetchDistributorByBlockId(blockId);
    this.resource.distributor_id = res.distributor_id;
    await this.distributorSelect.refresh();
    this.distributorSelect.reset();
  }
}
