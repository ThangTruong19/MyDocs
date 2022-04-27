import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import {
  SimpleTableHeader as TableHeader,
  ResourceParams,
} from '../../../../types/opa/user-screen';
import {
  Labels,
  Resources,
  ModalDescItem,
  ModalValues,
} from '../../../../types/common';

import { ExternalAppKind } from '../../../../constants/opa/user-screen';

import { KbaAbstractModalComponent } from '../../../shared/kba-abstract-component/kba-abstract-modal-compoenent';

@Component({
  selector: 'app-publish-setting-confirm-modal-content',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class PublishSettingConfirmModalComponent
  extends KbaAbstractModalComponent
  implements OnInit {
  @Input() resource;
  @Input() labels;
  @Input() params;
  @Input() categoryLists;
  @Input() categories;
  @Input() submit: () => void;

  ExternalAppKind = ExternalAppKind;
  thList: TableHeader[];
  modalTandemValues: ModalValues;
  comfirmResourcePaths = [
    'group_id',
    'group_item_publish_setting.display_count',
    'group_item_publish_setting.paper_size_id',
  ];
  thLists: { [category: string]: TableHeader[] } = {};
  currentCategoryId: string;

  constructor(activeModal: NgbActiveModal) {
    super(activeModal);
  }

  ngOnInit(): void {
    this.thList = this._createInitThList('');
    this.categories.forEach(category => {
      this.thLists[category.id] = this._renameThListLabel(
        this.thList,
        category.name
      );
    });
    this.currentCategoryId = this.categories[0].id;

    this.modalTandemValues = {
      requestHeaderParams: null,
      listDesc: this._createContentHeader(
        this.resource,
        this.comfirmResourcePaths
      ),
      listVal: this._createContentValues(
        this.params,
        this.comfirmResourcePaths
      ),
    };
    const check = (el: Element | null) => el && el.getBoundingClientRect().height > 0;

    const interval = setInterval(() => {
      const body = document.querySelector('.KBA-modal-body');
      const header = document.querySelector('app-kba-tandem-confirm');
      const container = document.querySelector('.table-container-modal');

      if (
        container &&
        check(body) &&
        (this.modalTandemValues.listDesc.length === 0 || check(header))
      ) {
        (container as HTMLElement).style.maxHeight = `${body.getBoundingClientRect()
          .height -
          header.getBoundingClientRect().height -
          30}px`;
        clearInterval(interval);
      }
    }, 50);
  }

  /**
   * 閉じるボタン押下時コールバック
   */
  onClickClose(): void {
    this._close('close');
  }

  /**
   * 登録ボタン押下時コールバック
   */
  onClickSubmit(): void {
    this.submit();
    this._close('submit');
  }

  /**
   * 設定メニュー変更時コールバック
   * @param categoryId カテゴリID
   */
  onTabChange(categoryId: string): void {
    this.currentCategoryId = categoryId;
  }

  /**
   * リソースに指定されたパスが存在するかチェック
   * @param path リソースのパス
   */
  exists(path: string): boolean {
    return _.get(this.resource, path) != null;
  }

  /**
   * 初期状態の一覧ヘッダ情報を作成
   * @param defaultName デフォルト名
   */
  private _createInitThList(defaultName: string): TableHeader[] {
    const listNames = ['name', 'dfm', 'cfm'];

    return _.map(listNames, name => ({
      label: this.labels[name] || defaultName,
      name: name,
      displayable: true,
      sortable: false,
    }));
  }

  /**
   * 最初の列の列名を変更した一覧ヘッダ情報を返す
   * @param thList 一覧ヘッダ情報
   * @param name 名前
   */
  private _renameThListLabel(
    thList: TableHeader[],
    name: string
  ): TableHeader[] {
    const newThList = _.cloneDeep(thList);
    newThList[0].label = name;
    return newThList;
  }

  /**
   * モーダル（上部）のヘッダ情報を作成
   * @param resource リソース情報
   * @param paths リソースパス
   */
  private _createContentHeader(
    resource: Resources,
    paths: string[]
  ): ModalDescItem[] {
    return _.reduce(
      paths,
      (result, path) => {
        const res = _.get(resource, path);
        if (res) {
          result.push({
            label: res.name,
            name: path,
            displayable: true,
          });
        }
        return result;
      },
      []
    );
  }

  /**
   * モーダル（上部）の設定値表示情報を作成
   * @param params メニュー情報設定値
   * @param paths リソースパス
   */
  private _createContentValues(params: ResourceParams, paths: string[]): any {
    return _.reduce(
      paths,
      (result, path) => {
        const value = _.get(this.params, path);
        _.set(result, path, this._getResourceValueName(path, value));
        return result;
      },
      {}
    );
  }

  /**
   * リソース値の名称取得
   *
   * リソースパスで指定したリソースについて、値に対応する名前を取得する。
   *
   * @param path リソースのパス
   * @param value 値
   */
  private _getResourceValueName(path: string, value: string): string {
    const res = _.get(this.resource, path);
    if (res) {
      const v = _.find(res.values, item => item.value === value);
      return v ? v.name : path;
    } else {
      return '';
    }
  }
}
