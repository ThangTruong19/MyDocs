import * as _ from 'lodash';
import * as b64toBlob from 'b64-to-blob';
import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

import { Contact } from '../../../../types/flm/contact';

import { ContactKind } from '../../../../constants/flm/contact-kind';

import { ContactFormComponent } from '../shared/form/contact-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { CommonState } from '../../../../constants/common-state';

@Component({
  selector: 'app-contact-edit',
  templateUrl: '../shared/form/contact-form.component.html',
  styleUrls: [
    '../shared/form/contact-form.component.scss',
    '../shared/photo-image.scss',
    '../shared/custom-confirm.scss',
  ],
})
export class ContactEditComponent extends ContactFormComponent
  implements OnInit {
  target: Contact;
  isUpdate = true;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    alert: KbaAlertService,
    modal: KbaModalService,
    contact: ContactService,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header, router, alert, modal, contact);
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      let id: string;
      this.activatedRoute.params.subscribe(params => (id = params.id));

      this.contactService.fetchEditInitData(id).then(res => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        this.loading = false;
        this.target = res.contact.result_data;
        const { params, imageSrc } = this._parameterize(this.target);
        this.params = params;
        this.croppedImageSrc = imageSrc;
        this.safeDetectChanges();
        resolve();
      });
    });
  }

  /**
   * 連絡先のデータをパラメータ化する
   * @param target 連絡先
   */
  protected _parameterize(target: Contact) {
    const params = _.cloneDeep(target);
    let imageSrc: string;

    if (params.contact.kind === this.ContactKind.general) {
      if (params.contact.general_contact.photo_exists_kind === CommonState.on) {
        const blob = (b64toBlob as any)(
          _.get(target.contact, 'general_contact.photo.image')
        );
        imageSrc = URL.createObjectURL(blob);
        params.contact.general_contact.photo.trim_data = {
          base_point_x: '0',
          base_point_y: '0',
          width:
            '' +
            this.target.contact.general_contact.photo.image_attribute.width,
          height:
            '' +
            this.target.contact.general_contact.photo.image_attribute.height,
        };
        params.contact.general_contact.photo.image_attribute = null;
      } else {
        params.contact.general_contact.photo = null;
      }
      params.contact.general_contact.photo_exists_kind = null;
    }

    return {
      params,
      imageSrc,
    };
  }

  /**
   * 連絡先を更新します。
   * @param params 変更後の値
   * @param path 変更後に遷移するパス
   */
  protected async _register(params: Contact, path: string) {
    await this.contactService.updateContact(this._trimParams(params));
    await this.router.navigateByUrl(path);
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * フォームの入力内容をリセットします。
   */
  protected _reset() {
    if (this.croppedImageSrc != null) {
      URL.revokeObjectURL(this.croppedImageSrc);
    }

    const { params, imageSrc } = this._parameterize(this.target);
    this.params = params;
    this.croppedImageSrc = imageSrc;
    this.safeDetectChanges();
    this.refreshFormTextInput();
  }

  /**
   * 不要なリクエストパラメータの項目を除去します。
   * @param params リクエストパラメータ
   */
  private _trimParams(params) {
    let { contact } = params;
    const { kind } = contact;

    contact = _.omit(contact, [
      'support_distributor_id',
      'support_distributor_label',
      'support_distributor_label_english',
      'kind',
    ]);

    contact = _.omit(
      contact,
      kind === ContactKind.representative
        ? 'general_contact'
        : [
          'represent_contact',
          'general_contact.photo_exists_code',
          'general_contact.photo.minimum_limit',
          'general_contact.photo.photo_data',
        ]
    );

    return { contact };
  }
}
