import { ViewChildren, QueryList } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { Title } from '@angular/platform-browser';
import { ClassService } from '../../../../../services/flm/class/class.service';
import { Router } from '@angular/router';
import { ClassParams } from '../../../../../types/flm/class';
import * as _ from 'lodash';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';

export abstract class ClassFormComponent extends KbaAbstractRegisterComponent {
  @ViewChildren(KbaFormTableSelectComponent) selectBoxes: QueryList<
    KbaFormTableSelectComponent
  >;

  classForm: FormGroup = new FormGroup({});

  isUpdate: boolean;
  params: ClassParams;
  descItem: any[];
  valItem: any;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected classService: ClassService,
    protected router: Router
  ) {
    super(nav, title, header);
  }

  /**
   * 登録ボタン押下コールバック
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? 'classes' : '';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue() {
    this._registerModalOpen('classes/new');
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected abstract _register(params: ClassParams, path: string);

  /**
   * 登録/変更 確認モーダルを表示する
   *
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string) {
    let requestParams;
    this.descItem = this._createRepDesc();
    this.valItem = this._createValItem();
    requestParams = this.params;
    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: () => this._register(requestParams, path),
    });
  }

  /**
   * 確認モーダル内のラベルを返す
   */
  private _createRepDesc() {
    const desc = [];
    let thList = [
      {
        path: 'class.support_distributor_id',
        name: 'support_distributor_label',
      },
      { path: 'class.kind_id', name: 'kind_name' },
      { path: 'class.label', name: 'label' },
    ];
    if (this.isUpdate) {
      // 分類区分と新しい分類名称の間に現在の分類名称を表示
      thList.splice(2, 0, {
        path: 'class.current_label',
        name: 'current_label',
      });
    }
    thList = thList.filter(
      th =>
        this.exists('class.support_distributor_id') ||
        th.path !== 'class.support_distributor_id'
    );
    _.each(thList, th => {
      if (_.get(this.resource, th.path)) {
        desc.push({
          label: _.get(this.resource, th.path).name,
          name: th.name,
          displayable: true,
        });
      } else {
        desc.push({
          label: this.labels[th.name],
          name: th.name,
          displayable: true,
        });
      }
    });
    return desc;
  }

  /**
   * 確認モーダル内に表示されるプロパティを返す
   */
  private _createValItem(): ClassParams {
    const val = _.cloneDeep(this.params);
    if (!this.isUpdate) {
      if (_.has(this.resource, 'class.support_distributor_id')) {
        val.support_distributor_label = this._getResourceValueName(
          'class.support_distributor_id',
          this.params.support_distributor_id
        );
      }
      val.kind_name = this._getResourceValueName(
        'class.kind_id',
        this.params.kind_id
      );
    }
    return val;
  }
}
