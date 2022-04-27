import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Contact } from '../../../../types/flm/contact';

import { ContactFormComponent } from '../shared/form/contact-form.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';

@Component({
  selector: 'app-contact-new',
  templateUrl: '../shared/form/contact-form.component.html',
  styleUrls: [
    '../shared/form/contact-form.component.scss',
    '../shared/photo-image.scss',
    '../shared/custom-confirm.scss',
  ],
  providers: [ContactService],
})
export class ContactNewComponent extends ContactFormComponent
  implements OnInit {
  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    contact: ContactService
  ) {
    super(nav, title, header, router, alert, modal, contact);
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.contactService.fetchInitNew().then(async res => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        await this.header.setHeader(this.labels, this.resource, this.functions);
        this.loading = false;
        resolve();
      });
    });
  }

  /**
  * 連絡先登録処理
  *
  * @param params 連絡先情報
  * @param path 登録後遷移先のパス
  */
  protected async _register(params: Contact, path: string) {
    await this.contactService.createContact(params);
    await this.router.navigateByUrl(path);
    this._reset();
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset() {
    this.contactForm.controls.representative.reset();
    this.contactForm.controls.general.reset();
    if (_.has(this.resource, 'contact.support_distributor_id')) {
      this.supportDistributorSelect.reset();
    }
    this.croppedImageSrc = null;
    _.unset(this.params.contact.general_contact, 'photo');
  }
}
