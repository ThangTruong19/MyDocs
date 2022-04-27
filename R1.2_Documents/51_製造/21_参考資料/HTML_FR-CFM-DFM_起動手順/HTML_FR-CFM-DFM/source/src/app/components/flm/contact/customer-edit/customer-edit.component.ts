import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { TableHeader } from '../../../../types/common';
import { ContactLinkParams } from '../../../../types/flm/contact';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';

import { ContactService } from '../../../../services/flm/contact/contact.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FilterReservedWord } from '../../../../constants/condition';

interface TempParams {
  [contactKind: string]: { contact_id: string };
}

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.scss'],
})
export class ContactCustomerEditComponent extends KbaAbstractRegisterComponent {

  private static readonly UNSELECTED = '-2'; // プルダウンのみ選択時
  private static readonly PHONE_FLAG = '1'; // 代表電話のrepresent_flag

  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;

  thList: TableHeader[];
  params: TempParams = {};
  target: ContactLinkParams;
  customer: {
    id: string;
    label: string;
    value: string;
  };
  originalThList: TableHeader[];
  descItem: TableHeader[];
  valItem: { [contactKind: string]: string };

  get isPhoneValid() {
    const thHeader = this.thList.find(th => th.represetntFlag === ContactCustomerEditComponent.PHONE_FLAG);
    if (this.params[thHeader.name].contact_id !== ContactCustomerEditComponent.UNSELECTED) {
        return true;
    } else {
        let paramsFlag = true;
        this.thList.forEach((th: TableHeader) =>  {
          if (thHeader.name !== th.name
              && this.params[th.name].contact_id !== ContactCustomerEditComponent.UNSELECTED) {
            paramsFlag = false;
          }
        });
        return paramsFlag;
    }
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    private contactService: ContactService,
    private modalService: KbaModalService,
    private router: Router,
    private alertService: KbaAlertService,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header);
  }

  /**
   * 担当DBセレクトボックスが初期状態から
   * 変更されていないかどうかを返却する
   * @param representFlag プルダウンの代表フラグ
   * @return true: 未変更 / false: 変更済
   */
   isSupportDBSelectNotEdit(representFlag: string): boolean {
    return (
      (!this.isPhoneValid && representFlag === ContactCustomerEditComponent.PHONE_FLAG
    ));
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => (this.params = this._resetParams(this.target)),
    });
  }

  /**
   * 変更ボタン押下時の処理
   */
  onClickSubmit() {
    this.descItem = this.thList.map(th => ({
      name: th.name,
      label: th.label,
      displayable: true,
    }));
    this.valItem = this.descItem.reduce(
      (result, th) => {
        result[th.name] = this._getResourceValueName(
          `contact_link.customer_contact_links:${th.name}.contact_id`,
          this.params[th.name].contact_id
        );
        return result;
      },
      {} as { [contactKind: string]: string }
    );

    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: () => this._register(this.params, this.target),
    });
  }

  /**
   * 画面の初期化を行います。
   */
  protected async _fetchDataForInitialize() {
    const params = {
      support_distributor_id: '',
      customer_ids: [],
    };
    this.activatedRoute.queryParams.subscribe(
      query => (params.support_distributor_id = query.support_distributor_id)
    );
    this.activatedRoute.params.subscribe(p => params.customer_ids.push(p.id));
    const res = await this.contactService.fetchCustomerEditInitData(params);
    const contactKindResource = await this.contactService.fetchCustomerContactLinksResouece(
      params.customer_ids[0]
    );
    this.initialize(res);
    this.labels = res.label;
    this.resource = _.merge(res.resource, contactKindResource);
    this.target = res.links.result_data.contact_links[0];
    this._setTitle();

    if (this.target == null) {
      this.params = null;
      return;
    }

    if (this.exists('contact_link.customer_contact_links')) {
      for (const contactLinkKind of this.resource.contact_link
        .customer_contact_links.values) {
        const contactLinkResource = await this.contactService.fetchContactLinkResource(
          contactLinkKind.value,
          params.customer_ids[0]
        );

        this.resource.contact_link[
          `customer_contact_links:${contactLinkKind.value}`
        ] = {
          contact_id:
            contactLinkResource.contact_link.customer_contact_links
              .contact_kind_code,
        };
      }
    }
    const contactLinkKinds = (await this.contactService.fetchContactLinkKinds(
      params.support_distributor_id
    )).result_data.customer_contact_link_kinds;
    this.thList = this.contactService.formatCustomerHeaderEdit(contactLinkKinds);
    this.params = this._resetParams(this.target);
    this.customer = {
      id: params.customer_ids[0],
      label: this.labels.customer,
      value: this.target.customer_label,
    };
  }

  /**
   * パラメータを初期化・リセット
   * @param target 変更対象
   */
  private _resetParams(target: ContactLinkParams) {
    if (target == null) {
      return this.params;
    }

    const params: TempParams = {};
    target.customer_contact_links.forEach(
      contactLink =>
        (params[contactLink.contact_kind_code] = {
          contact_id: contactLink.contact_id,
        })
    );
    return params;
  }

  /**
   * 登録処理
   * @param tempParams パラメータ
   * @param target 変更対象
   */
  private async _register(tempParams: TempParams, target: ContactLinkParams) {
    const params: ContactLinkParams = {
      update_datetime: target.update_datetime,
      customer_contact_links: target.customer_contact_links.map(
        contactLink => {
          const contactId = tempParams[contactLink.contact_kind_code].contact_id;
          return {
            contact_kind_code: contactLink.contact_kind_code,
            contact_id: contactId !== FilterReservedWord.isNull ? contactId : '',
          };
        }
      ),
    };

    try {
      await this.contactService.updateContactLink(this.customer.id, params);
      await this.router.navigateByUrl('/contacts/customers');
      this.alertService.show(this.labels.finish_message);
    } catch (errorData) {
      this._setError(errorData, this.alertService);
    }
  }
}
