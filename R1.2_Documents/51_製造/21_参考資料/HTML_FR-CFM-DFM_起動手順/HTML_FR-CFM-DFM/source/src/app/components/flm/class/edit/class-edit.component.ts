import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ClassFormComponent } from '../../../../components/flm/class/shared/form/class-form.component';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { Title } from '@angular/platform-browser';
import { ClassService } from '../../../../services/flm/class/class.service';
import { ClassParams } from '../../../../types/flm/class';

@Component({
  selector: 'app-class-edit',
  templateUrl: '../shared/form/class-form.component.html',
})
export class ClassEditComponent extends ClassFormComponent implements OnInit {
  isUpdate = true;

  params: ClassParams = {
    kind_id: '',
    kind_name: '',
    id: '',
    label: '',
    current_label: '',
    update_datetime: '',
  };

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    alertService: KbaAlertService,
    modalService: KbaModalService,
    classService: ClassService,
    router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header, alertService, modalService, classService, router);
  }

  protected async _fetchDataForInitialize() {
    let queryParams;

    this.activatedRoute.params.subscribe(params => (queryParams = params));
    this.activatedRoute.queryParams.subscribe(
      params =>
        (queryParams = {
          ...queryParams,
          ...params,
        })
    );

    const res = await this.classService.fetchEditInitData(queryParams);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (res.classItem.result_data.classes[0] == null) {
      this.params = null;
      return;
    }

    this._setTargetClassItem(res.classItem.result_data);
  }

  protected _register(params: ClassParams, path: string): void {
    this.classService
      .updateClass(params)
      .then(res => {
        this.router.navigate([path]).then(e => {
          this.alertService.show(this.labels.finish_message);
        });
      })
      .catch(errorData => {
        this._setError(errorData, this.alertService);
      });
  }

  /**
   * 変更対象のデータをパラメータに引き渡す
   * @param data 分類取得APIのレスポンスデータ
   */
  private _setTargetClassItem(data) {
    if (this.resource.class.support_distributor_id) {
      this.params.support_distributor_id =
        data.classes[0].support_distributor_id;
      this.params.support_distributor_label =
        data.classes[0].support_distributor_label;
    }
    this.params.kind_id = data.classes[0].kind_id;
    this.params.kind_name = data.classes[0].kind_name;
    this.params.id = data.classes[0].id;
    this.params.current_label = data.classes[0].label;
    this.params.update_datetime = data.classes[0].update_datetime;
    return this.params;
  }
}
