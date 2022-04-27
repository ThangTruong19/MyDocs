import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api, TableHeader, Resources, Fields } from '../../../types/common';
import { RequestHeaderParams } from '../../../types/request';
import {
  ContactIndexParams,
  Contact,
  ContactCustomerParams,
  TrimmingData,
  ContactLinkParams,
} from '../../../types/flm/contact';

import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';

import { ScreenCode } from '../../../constants/flm/screen-codes/contact-management';
import { FunctionCode } from '../../../constants/flm/function-codes/contact-management';

@Injectable()
export class ContactService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 連絡先一覧の初期表示に必要な情報を取得
   */
  fetchIndexInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(ScreenCode.list, 'fetchInitIndex', {
      updatable: Apis.putContacts_contactId_,
      deletable: Apis.deleteContacts_contactId_,
      genFields: () => this.api.fetchFields(FunctionCode.listGeneralFunction),
    });
  }

  /**
   * 連絡先情報リスト取得APIを実行
   *
   * @param {Object} params APIパラメータ
   * @param {RequestHeaderParams} requestHeaderParams API ページネーション用パラメータ
   * @param {Object} opt APIパラメータ
   */
  fetchIndexList(
    params: ContactIndexParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getContacts, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 連絡先紐付け一覧の初期化に必要な情報を取得します。
   * @param opt パラメータ
   */
  fetchCustomerIndexInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.customerList;
    return this.api.callApisForInitialize(
      ScreenCode.customerList,
      'fetchCustomerIndexInit',
      {
        fields: () => this.api.fetchFields(FunctionCode.customerListFunction),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.customerListDownloadFunction),
        unlinkFields: () =>
          this.api.fetchFields(FunctionCode.customerListUnlinkFunction),
        updatable: Apis.putContactsCustomers_customerId_,
        deletable: Apis.putContactsCustomers_customerId_,
      }
    );
  }

  /**
   * 連絡先紐付け一覧のリスト表示に必要な情報を取得します。
   * @param params パラメータ
   * @param requestHeaderParams API ページネーション用パラメータ
   * @param opt パラメータ
   */
  fetchCustomerIndexList(
    params: ContactCustomerParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCustomerIndexList',
        this.fetchContactLinks(params, {
          cache: false,
          request_header: requestHeaderParams,
        }).subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 連絡先紐付け変更画面の初期化に必要な情報を取得します。
   * @param opt パラメータ
   */
  fetchCustomerEditInitData(params) {
    this.api.currentScreenCode = ScreenCode.customerEdit;
    return this.api.callApisForInitialize(
      ScreenCode.customerEdit,
      'fetchCustomerEditInitData',
      {
        links: () => this.fetchContactLinks(params),
      }
    );
  }

  /**
   * 連絡先紐付け情報取得 API
   * @param params リクエストパラメータ
   * @param opt リクエストパラメータ
   */
  fetchContactLinks(params: any, headers?): Observable<Api> {
    return this.api.post(Apis.postContactsCustomersSearch, params, headers);
  }

  /**
   * ファイル作成APIを実行
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createFile(params, requestHeaderParams: RequestHeaderParams): Promise<Api> {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .post(Apis.postContactsCustomersSearchFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 連絡先登録の初期表示に必要な情報を取得
   * 連絡先情報削除APIを実行
   *
   * @param  id APIパラメータ
   * @return 応答本文
   */
  deleteContact(id: string, update_datetime: string) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteContact',
        this.api
          .delete(
            {
              apiId: Apis.deleteContacts_contactId_,
              params: [id],
            },
            { update_datetime }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 連絡先登録の初期表示に必要な情報を取得
   */
  fetchInitNew() {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * 連絡先更新の初期化に必要な情報を取得
   * @param id 連絡先紐付けの ID
   */
  fetchEditInitData(id: string) {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        contact: () => this._fetchContactDetail(id),
      }
    );
  }

  /**
   * 連絡先詳細取得APIを実行
   *
   * @param id 連絡先ID
   */
  fetchContactDetail(
    id: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchContactDetail',
        this.api
          .get(
            {
              apiId: Apis.getContacts_contactId_,
              params: [id],
            },
            null,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 連絡先情報登録APIを実行
   *
   * @param params APIパラメータ
   * @return 応答本文
   */
  createContact(params: Contact): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createContact',
        this.api
          .post(Apis.postContacts, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  checkContactImage(params): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'checkContactImage',
        this.api
          .post(Apis.postContactsImageCheck, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /*
   * 連絡先画像トリミングAPIを実行
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  trimmingContactPhoto(params: TrimmingData): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'trimmingContactPhoto',
        this.api.post(Apis.postContactsImageCheck, params).subscribe(res => {
          resolve(res);
        })
      );
    });
  }

  /**
   * 連絡先更新 API を実行
   * @param params パラメータ
   */
  updateContact(params: Contact) {
    const id = params.contact.id;

    _.unset(params, 'contact.id');
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateContact',
        this.api
          .put(
            {
              apiId: Apis.putContacts_contactId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 担当DBの選択値が変更された場合、それに対応した顧客を取得してくる
   * @param screenCode 画面ID
   * @param opt    担当DBid
   */
  fetchCustomerBelongingToDistributor(
    screenCode: string,
    opt: { support_distributor_id: string }
  ) {
    const search_parameters = [
      {
        resource_path: 'customer_ids',
        condition_sets: [
          {
            condition: 'support_distributor_id',
            values: [opt.support_distributor_id],
          },
        ],
      },
    ];
    const items = _.extend({
      screen_code: screenCode,
      search_parameters: search_parameters,
    });
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchCustomerBelongingToDistributor',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * 一般連絡先の指定項目取得 API を実行
   */
  fetchGeneralFields(): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGeneralFieldResources',
        this.api.fetchFields('general_contact').subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 連絡先紐付け更新 API を実行
   * @param params パラメータ
   */
  updateContactLink(customerId, params: ContactLinkParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateContactLink',
        this.api
          .put(
            {
              apiId: Apis.putContactsCustomers_customerId_,
              params: [customerId],
            },
            { contact_link: params },
            {
              exclusionKeys: ['contact_link.customer_contact_links.contact_id'],
            }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 見出し取得 API で取得したデータをテーブルのヘッダとして使用できる形に成形します。
   * @param kinds API から取得した紐付けの種別
   * @param items API から取得するもの以外にヘッダに追加するデータ
   */
  formatCustomerHeader(kinds: any[], thList: TableHeader[] = []) {
    let index = thList.length;

    return thList.concat(
      kinds
        .sort((a, b) => +a.order - +b.order)
        .map((kind, i) => ({
          id: index++,
          name: kind.code,
          shortName: kind.code,
          label: kind.name,
          displayable: true,
          iconNo: kind.icon_font.no,
          sortKey: `contact_links.customer_contact_links:${i}.contact_label`,
          sortable: [0, 1].includes(i),
        }))
    );
  }

  /**
   * 見出し取得 API で取得したデータをテーブルのヘッダとして使用できる形に成形します。
   * 編集用
   * @param kinds API から取得した紐付けの種別
   * @param items API から取得するもの以外にヘッダに追加するデータ
   */
  formatCustomerHeaderEdit(kinds: any[], thList: TableHeader[] = []) {
    let index = thList.length;

    return thList.concat(
      kinds
        .sort((a, b) => +a.order - +b.order)
        .map((kind, i) => ({
          id: index++,
          name: kind.code,
          shortName: kind.code,
          label: kind.name,
          displayable: true,
          iconNo: kind.icon_font.no,
          sortKey: `contact_links.customer_contact_links:${i}.contact_label`,
          sortable: [0, 1].includes(i),
          represetntFlag: kind.represent_flag,
        }))
    );
  }

  /**
   * 連絡先紐付けの各リソースを取得する
   */
  fetchContactLinkResource(
    contactKindCode: string,
    customerId: string
  ): Promise<Resources> {
    return new Promise(resolve => {
      this.api.requestHandler(
        'fetchContactLinkResource',
        this.api
          .fetchResource(ScreenCode.customerEdit, [
            {
              condition_sets: [
                {
                  values: [contactKindCode],
                  condition: 'contact_link.customer_contact_links',
                },
                {
                  values: [customerId],
                  condition: 'customer_id',
                },
              ],
              resource_path:
                'contact_link.customer_contact_links.contact_kind_code',
            },
          ])
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 連絡先紐付け見出し取得 API
   */
  fetchContactLinkKinds(supportDB: string) {
    return new Promise<Api>(resolve => {
      this.api.requestHandler(
        'fetchContactLinkKinds',
        this.api
          .get(Apis.getContactsCustomersResponseItems, {
            support_distributor_id: supportDB,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 連絡先役割一覧のリソースを取得する
   * @param customerId 顧客ID
   */
  fetchCustomerContactLinksResouece(customerId: string) {
    const params = [
      {
        resource_path: 'contact_link.customer_contact_links',
        condition_sets: [
          {
            condition: 'customer_id',
            values: [customerId],
          },
        ],
      },
    ];

    return new Promise<Api>(resolve => {
      this.api.requestHandler(
        'fetchCustomerContactLinksResouece',
        this.api
          .fetchResource(ScreenCode.customerEdit, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 代表連絡先削除モーダル用指定項目取得
   */
  fetchRepDeleteFields() {
    return new Promise<Api>((resolve) => {
      this.api.requestHandler('fetchRepDeleteFields',
        this.api
          .fetchFields(FunctionCode.listRepresentDeleteFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一般連絡先削除モーダル用指定項目取得
   */
  fetchGenDeleteFields() {
    return new Promise<Api>((resolve) => {
      this.api.requestHandler('fetchGenDeleteFields',
        this.api
          .fetchFields(FunctionCode.listGeneralDeleteFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 代表連絡先一覧用指定項目取得
   */
  fetchRepFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchRepFields',
        this.api
          .fetchFields(FunctionCode.listRepresentFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 連絡先紐付け見出し取得 API
   */
  private _fetchContactDetail(id: string): Observable<Api> {
    return this.api.get({
      apiId: Apis.getContacts_contactId_,
      params: [id],
    });
  }
}
