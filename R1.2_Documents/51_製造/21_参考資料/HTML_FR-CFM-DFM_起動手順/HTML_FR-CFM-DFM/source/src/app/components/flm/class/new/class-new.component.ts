import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ClassFormComponent } from '../shared/form/class-form.component';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { Title } from '@angular/platform-browser';
import { ClassService } from '../../../../services/flm/class/class.service';
import { has } from 'lodash';
import { ClassParams } from '../../../../types/flm/class';

@Component({
  selector: 'app-class-new',
  templateUrl: '../shared/form/class-form.component.html',
})
export class ClassNewComponent extends ClassFormComponent implements OnInit {
  isUpdate = false;

  params: ClassParams = {
    support_distributor_id: '',
    kind_id: '',
    label: '',
  };

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    alertService: KbaAlertService,
    modalService: KbaModalService,
    classService: ClassService,
    router: Router
  ) {
    super(nav, title, header, alertService, modalService, classService, router);
  }

  /**
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

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.classService.fetchInitNew().then(res => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        resolve();
      });
    });
  }

  protected _register(params: ClassParams, path: string): void {
    this.classService
      .createClass(params)
      .then(res => {
        this.router.navigate([path]).then(e => {
          this._reset();
          this.alertService.show(this.labels.finish_message);
        });
      })
      .catch(errorData => {
        this._setError(errorData, this.alertService);
      });
  }

  /**
   * フォームに入力された内容をリセットする
   */
  private _reset() {
    this.selectBoxes.toArray().forEach(th => th.reset());
    this.classForm.reset();
  }
}
