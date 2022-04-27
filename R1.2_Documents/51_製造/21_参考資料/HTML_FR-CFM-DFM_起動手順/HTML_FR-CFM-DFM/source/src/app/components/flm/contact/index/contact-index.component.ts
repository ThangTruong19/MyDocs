import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { ContactIndexParams } from '../../../../types/flm/contact';
import { Api, ModalValues } from '../../../../types/common';
import { TableHeader } from '../../../../types/common';

import { ContactKind } from '../../../../constants/flm/contact-kind';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  moduleId: module.id,
  selector: 'app-contact-index',
  templateUrl: './contact-index.component.html',
  styleUrls: [
    './contact-index.component.scss',
    '../shared/photo-image.scss',
    '../shared/custom-confirm.scss',
  ],
  providers: [ContactService, KbaModalService],
})
export class ContactIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild(KbaSelectedComponent, { static: false })
  supportDistributorSelect: KbaSelectedComponent;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  // 登録画像の有無判定用
  PHT_DISP_CODE = {
    none: '0',
    exist: '1',
  };

  ContactKind = ContactKind;

  params: ContactIndexParams;
  nameAndPhoneParams: {
    company_name?: string;
    phone_no?: string;
    search_name?: string;
    search_phone_no?: string;
  } = {};

  repThList: TableHeader[];
  genThList: TableHeader[];
  repXFields: string[];
  genXFields: string[];
  repDeleteModalValues: ModalValues;
  genDeleteModalValues: ModalValues;

  repHeaderPromise: Promise<void>;
  repDeleteModalPromise: Promise<void>;
  genDeleteModalPromise: Promise<void>;

  genLists = {
    originList: [],
    visibleList: [],
  };
  repLists = {
    originList: [],
    visibleList: [],
  };
  genSortableThList: string[];
  repSortableThList: string[];
  descItem: any;
  valItem: any;
  notSortingColumns = ['contacts.general_contact.photo_exists_kind'];

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private contactService: ContactService,
    private alertService: KbaAlertService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * 検索処理
   * @return
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 削除処理
   *
   * @param item 削除対象
   */
  async onClickDelete(item) {
    this.deleteModalValues = _.cloneDeep(
      item.kind === ContactKind.representative
        ? this.repDeleteModalValues
        : this.genDeleteModalValues
    );

    if (this.deleteModalValues == null) {
      const modalPromise = item.kind === ContactKind.representative
        ? this.repDeleteModalPromise
        : this.genDeleteModalPromise;

      this._showLoadingSpinner();
      await modalPromise;
      this._hideLoadingSpinner();
      return this.onClickDelete(item);
    }

    const contact = (await this.contactService.fetchContactDetail(
      item.id,
      this.deleteModalValues.requestHeaderParams
    )).result_data;
    this.valItem = contact;

    this.modalService.open({
      title: this.labels.delete_confirm_message,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      ok: async () => {
        await this.contactService.deleteContact(
          contact.contact.id,
          contact.contact.update_datetime
        );
        this.alertService.show(this.labels.complete_message);
        this.fetchList(this.sortingParams.sort);
      },
    });
  }

  /**
   * 変更画面遷移
   * @param item 変更対象
   */
  onClickEdit(item): void {
    this.router.navigate(['contacts/', item.id, 'edit']);
  }

  fetchList(sort_key?: string) {
    return new Promise(resolve => {
      this.isFetching = true;
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      this.contactService
        .fetchIndexList(this.searchParams, this.requestHeaderParams)
        .then((res: Api) => {
          this._fillLists(res.result_header, res.result_data.contacts);
          this.isFetching = false;
          this._afterFetchList();
          resolve();
        });
    });
  }

  /**
   * 表示する連絡先種別を設定します。
   */
  async setVisibleContactKind(kind, callFetchList = true) {
    if (kind === ContactKind.representative && this.repThList == null) {
      this._showLoadingSpinner();
      await this.repHeaderPromise;
      this._hideLoadingSpinner();
    }

    this.params.contact_kind = kind;
    this._resetSearchParams();
    this.sortingParams.sort = '';
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();
    this._setXFields(this._getCurrentContactKindXField());
    this.thList = _.cloneDeep(
      kind === ContactKind.representative ? this.repThList : this.genThList
    );
    this.sortableThList = _.cloneDeep(
      kind === ContactKind.representative
        ? this.repSortableThList
        : this.genSortableThList
    );

    if (callFetchList) {
      this.fetchList();
    }
  }

  /**
   * 連絡先種別のラベルを取得
   * @param value 連絡先種別に対応する値
   */
  getContactKindLabel(value) {
    if (
      this.resource &&
      this.resource.contact_kind &&
      this.resource.contact_kind.values
    ) {
      return this.resource.contact_kind.values.find(
        _value => _value.value === value
      ).name;
    }
  }

  protected async _fetchDataForInitialize() {
    const res = await this.contactService.fetchIndexInitData();
    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this.genThList = this._createThList(res.genFields);
    this.genXFields = this._createXFields(res.genFields);
    this.genSortableThList = this.sortableThLists(this.genThList);
    this.setVisibleContactKind(ContactKind.general, false);
  }

  protected _afterInitFetchList() {
    // 非同期取得
    this.repHeaderPromise = this._buildRepHeader();
    this.repDeleteModalPromise = this._buildRepDeleteModalValues();
    this.genDeleteModalPromise = this._buildGenDeleteModalValues();
  }

  /**
   * データキー取得
   *
   * 一覧に表示するデータについて、参照するためのキーを取得する。
   * ドット区切りのパスの最初の要素を除去したものをデータキーとする。
   *
   * @param key キー（指定項目のパス）
   */
  protected _dataKey(key: string) {
    return _.slice(key.split('.'), 1).join('.');
  }

  protected _confirmKey(key: string) {
    return null;
  }

  /**
   * 連絡先種別によるX-Fieldデータの取得
   */
  private _getCurrentContactKindXField() {
    return this.params.contact_kind === ContactKind.representative
      ? this.repXFields
      : this.genXFields;
  }

  /**
   * 検索欄リセット
   */
  private _resetSearchParams() {
    this.params.contact_label = '';
    this.params.phone_no = '';

    if (this.params.contact_kind === ContactKind.representative) {
      this.nameAndPhoneParams.company_name = '';
      this.nameAndPhoneParams.phone_no = '';
    } else {
      this.nameAndPhoneParams.search_name = '';
      this.nameAndPhoneParams.search_phone_no = '';
    }

    if (this.supportDistributorSelect) {
      this.supportDistributorSelect.reset();
    }
    this.searchParams = _.cloneDeep(this.params);
  }

  /**
   * 連絡先（代表）のテーブルヘッダを取得
   */
  private _buildRepHeader(): Promise<void> {
    return new Promise((resolve) => {
      this.contactService.fetchRepFields().then((res) => {
        this.repXFields = this._createXFields(res);
        this.repThList = this._createThList(res);
        this.repSortableThList = this.sortableThLists(this.repThList);
        resolve();
      });
    });
  }

  /**
   * 連絡先（代表）の削除モーダルヘッダを生成
   */
  private _buildRepDeleteModalValues(): Promise<void> {
    return new Promise((resolve) => {
      this.contactService.fetchRepDeleteFields().then(res => {
        this.repDeleteModalValues = this._getModalValues(res);
        resolve();
      });
    });
  }

  /**
   * 連絡先（一般）の削除モーダルヘッダを生成
   */
  private _buildGenDeleteModalValues(): Promise<void> {
    return new Promise((resolve) => {
      this.contactService.fetchGenDeleteFields().then((res) => {
        this.genDeleteModalValues = this._getModalValues(res);
        resolve();
      });
    });
  }
}
