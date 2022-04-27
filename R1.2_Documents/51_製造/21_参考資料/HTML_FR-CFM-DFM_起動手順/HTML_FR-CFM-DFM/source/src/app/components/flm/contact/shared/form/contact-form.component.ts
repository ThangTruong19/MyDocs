import * as _ from 'lodash';
import * as b64toBlob from 'b64-to-blob';
import { TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Contact } from '../../../../../types/flm/contact';

import { ContactKind } from '../../../../../constants/flm/contact-kind';
import { FilterReservedWord } from '../../../../../constants/condition';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { PhotoModalComponent } from './photo-modal.component';

import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { ContactService } from '../../../../../services/flm/contact/contact.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';

export abstract class ContactFormComponent extends KbaAbstractRegisterComponent
  implements OnDestroy {
  @ViewChild(KbaFormTableSelectComponent, { static: false })
  supportDistributorSelect: KbaFormTableSelectComponent;
  @ViewChild('deleteImageModalContent', { static: false })
  deleteImageModalContent: TemplateRef<null>;

  loading = true;
  ContactKind = ContactKind;
  contactForm: FormGroup = new FormGroup({
    representative: new FormGroup({}),
    general: new FormGroup({}),
  });
  params: Contact = {
    contact: {
      support_distributor_id: FilterReservedWord.selectAll,
      kind: ContactKind.general,
      represent_contact: {
        label: '',
        phone_no: '',
      },
      general_contact: {
        label: '',
        email: '',
        office_phone_no: '',
        cell_phone_no: '',
      },
    },
  };
  validFile = {
    underMaxSize: true,
    underMaxLength: true,
    correctFormat: true,
  };
  maxFileSize = 10 * 1024 * 1024;
  photoFileFormats = ['bmp', 'jpeg', 'jpg', 'gif'];
  existGeneralContact = true;
  croppedImageSrc: string;
  descItem: any[];
  valItem: any;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected contactService: ContactService
  ) {
    super(nav, title, header);
  }

  ngOnDestroy() {
    if (this.croppedImageSrc != null) {
      URL.revokeObjectURL(this.croppedImageSrc);
    }
  }

  /**
   * 連絡先の種別リソースを取得する
   */
  getContactKindResouce(kind: string) {
    return this.resource.contact.kind.values.find(val => val.value === kind);
  }

  /**
   * 入力内容リセットコールバック
   *
   * 入力内容リセット確認モーダルを表示する。
   * 確認後、入力内容をリセットする。
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録/変更ボタン押下コールバック
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? 'contacts' : '';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue() {
    this._registerModalOpen('contacts/new');
  }

  /**
   * 連絡先種別選択コールバック
   *
   * @param value 連絡先種別値
   */
  onSelectContactKind(value: number): void {
    this.params.contact.kind = String(value);
    this.safeDetectChanges();
  }

  /**
   * 写真用画像ファイル選択コールバック
   *
   * @param target ファイル選択のHTML要素
   */
  onSelectPhotoFile(target: HTMLInputElement): void {
    const file: File = target.files[0];
    target.value = '';
    this._fileValidationClear();

    if (file == null) {
      return;
    }

    if (!this._fileFormatCheck(file)) {
      this.alertService.show(this.labels.valid_file_format, true, 'danger');
      return;
    }

    const fileReader = new FileReader();
    fileReader.onloadend = (loadEvent: any) => {
      this._processImage(file, loadEvent.target.result);
    };
    fileReader.readAsDataURL(file);
  }

  /**
   * 写真画像削除ボタン押下コールバック
   */
  onClickDeletePhoto(): void {
    this.modalService.open({
      title: this.labels.delete_image_modal_title,
      labels: this.labels,
      content: this.deleteImageModalContent,
      ok: () => {
        _.unset(this.params.contact.general_contact, 'photo');
        URL.revokeObjectURL(this.croppedImageSrc);
        this.croppedImageSrc = null;
      },
    });
  }

  /**
   * 連絡先の存在チェック
   *
   * 電子メール、勤務先電話番号、携帯電話番号のいずれかが存在するかをチェック
   */
  checkExistGeneralContact() {
    this.existGeneralContact =
      !_.isEmpty(this.params.contact.general_contact.email) ||
      !_.isEmpty(this.params.contact.general_contact.office_phone_no) ||
      !_.isEmpty(this.params.contact.general_contact.cell_phone_no);
  }

  protected _getContactKindText(code: string) {
    switch (code) {
      case ContactKind.general:
        return 'general';
      case ContactKind.representative:
        return 'representative';
    }
  }

  protected _fetchDataForInitialize() { }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected abstract async _register(params: Contact, path: string);

  /**
   * フォームに入力された内容をリセットする
   */
  protected abstract _reset();

  /**
   * 選択画像のチェック処理
   * @param file ファイル情報
   * @param image 画像
   */
  private async _processImage(file: File, base64Str: string) {
    if (!this._fileValidationCheck(file.size)) {
      this.alertService.show(this.labels.valid_file_size, true, 'danger');
      return;
    }

    try {
      const res = await this.contactService.checkContactImage({
        photo: { image: this._formatBase64Data(base64Str) },
      });
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.src = url;
      image.onload = () => {
        this._photoModalOpen(file.name, res.result_data.photo, url, {
          width: image.width,
          height: image.height,
        });
      };
    } catch (errorData) {
      this._setError(errorData, this.alertService);
    }
  }

  /**
   * Base64形式の画像のフォーマットを整形する
   */
  private _formatBase64Data(data: string) {
    return data.split(',')[1];
  }

  /**
   * 写真画像モーダルオープン
   *
   * @param fileName 写真画像のファイル名
   * @param imageData 画像データ
   * @param imageSize 画像サイズ
   */
  private _photoModalOpen(
    fileName: string,
    imageData: any,
    url: string,
    imageSize: any
  ) {
    this.modalService.customOpen(
      PhotoModalComponent,
      {
        labels: this.labels,
        fileName: fileName,
        imageSrc: imageData.image,
        imageSize: imageSize,
        minimumLimit: imageData.minimum_limit,
        url,
        submit: croppedData => {
          if (this.croppedImageSrc != null) {
            URL.revokeObjectURL(this.croppedImageSrc);
          }

          const base64String = this._formatBase64Data(
            croppedData.image.toDataURL()
          );
          const blob = (b64toBlob as any)(base64String);
          this.croppedImageSrc = URL.createObjectURL(blob);
          this.params.contact.general_contact.photo = {
            image: imageData.image,
            trim_data: croppedData.trimData,
          };
        },
      },
      {
        windowClass: 'photo-modal',
        backdrop: 'static',
      }
    );
  }

  /**
   * 登録確認画面オープン
   *
   * 登録/変更確認モーダルを表示する。
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string) {
    let requestParams;
    if (this.params.contact.kind === ContactKind.representative) {
      this.descItem = this._createRepDesc();
      requestParams = _.omit(this.params, 'contact.general_contact');
    } else if (this.params.contact.kind === ContactKind.general) {
      this.descItem = this._createGenDesc();
      requestParams = _.omit(this.params, 'contact.represent_contact');
    }
    this.valItem = this._createValItem();

    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: async () => {
        try {
          await this._register(requestParams, path);
        } catch (errorData) {
          this._setError(errorData, this.alertService);
        }
      },
    });
  }

  /**
   * 写真画像形式のバリデーション
   *
   * @param file ファイル
   */
  private _fileFormatCheck(file: File) {
    const format = _.lowerCase(_.last(file.name.split('.')));
    if (!_.includes(this.photoFileFormats, format)) {
      this.validFile.correctFormat = false;
    }
    return this.validFile.correctFormat;
  }

  /**
   * 写真画像のバリデーション
   *
   * @param fileSize ファイルサイズ
   * @param image 画像
   */
  private _fileValidationCheck(fileSize: number): boolean {
    if (fileSize > this.maxFileSize) {
      this.validFile.underMaxSize = false;
    }
    return this.validFile.underMaxSize && this.validFile.underMaxLength;
  }

  /**
   * 写真画像のバリデーション状態をクリア
   */
  private _fileValidationClear() {
    this.validFile.underMaxSize = true;
    this.validFile.underMaxLength = true;
    this.validFile.correctFormat = true;
  }

  /**
   * 代表用の確認モーダルのヘッダ情報を返す
   */
  private _createRepDesc() {
    const desc = this._getCommonDesc();
    _.each(['label', 'phone_no'], name => {
      const item = _.get(this.resource.contact.represent_contact, name);
      if (item) {
        desc.push({
          label: item.name,
          name: 'contact.represent_contact.' + name,
          displayable: true,
        });
      }
    });
    return desc;
  }

  /**
   * 一般用の確認モーダルのヘッダ情報を返す
   */
  private _createGenDesc() {
    const desc = this._getCommonDesc();
    _.each(
      ['label', 'email', 'office_phone_no', 'cell_phone_no', 'photo.image'],
      name => {
        const item = _.get(this.resource.contact.general_contact, name);
        if (item) {
          desc.push({
            label: item.name,
            name: 'contact.general_contact.' + name,
            displayable: true,
          });
        }
      }
    );
    return desc;
  }

  /**
   * 代表・一般共用の確認モーダルのヘッダ情報を返す
   */
  private _getCommonDesc() {
    const desc = [];
    const thList = [
      { path: 'contact.kind', name: 'contact_kind_name' },
      {
        path: 'contact.support_distributor_id',
        name: 'support_distributor_label',
      },
    ];
    _.each(thList, th => {
      if (_.get(this.resource, th.path)) {
        desc.push({
          label: _.get(this.resource, th.path).name,
          name: th.name,
          displayable: true,
        });
      }
    });
    return desc;
  }

  /**
   * 確認モーダルの内容を返す
   */
  private _createValItem(): Contact {
    const val = _.cloneDeep(this.params);
    if (_.has(this.resource, 'contact.kind')) {
      val.contact_kind_name = this._getResourceValueName(
        'contact.kind',
        this.params.contact.kind
      );
    }
    if (_.has(this.resource, 'contact.support_distributor_id')) {
      val.support_distributor_label = this.isUpdate
        ? val.contact.support_distributor_label
        : this._getResourceValueName(
          'contact.support_distributor_id',
          this.params.contact.support_distributor_id
        );
    }
    return val;
  }
}
