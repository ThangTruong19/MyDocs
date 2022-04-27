import {
  set,
  get,
  cloneDeep,
  isEmpty,
  every,
  some,
  includes,
  reduce,
  merge,
} from 'lodash';
import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import {
  TerminalChangeParams,
  TerminalChangeDisplayData,
} from '../../../../types/flm/car';

import { CommonHeaderAttribute } from '../../../../constants/common-header-attribute';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../shared/kba-form-table-select/kba-form-table-select.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/car-management';

@Component({
  selector: 'app-car-terminal-change',
  templateUrl: './terminal-change.component.html',
  styleUrls: ['./terminal-change.component.scss'],
})
export class CarTerminalChangeComponent extends KbaAbstractRegisterComponent {
  @ViewChild('makerSelect', { static: false })
  makerSelect: KbaFormTableSelectComponent;
  @ViewChild('modelSelect', { static: false })
  modelSelect: KbaFormTableSelectComponent;
  @ViewChild('typeSelect', { static: false })
  typeSelect: KbaFormTableSelectComponent;
  @ViewChild('terminalChangeSubmitModalContent', { static: false })
  terminalChangeSubmitModalContent: TemplateRef<null>;

  carId: string;
  params: TerminalChangeParams;
  carSearchParams;
  initCarSearchParams = {
    common: {
      car_identification: {
        maker_codes: '',
        models: '',
        type_revs: '',
        serials: '',
      },
    },
  };
  displayData: TerminalChangeDisplayData;
  carForm: FormGroup = new FormGroup({});
  carTerminalChangeForm: FormGroup = new FormGroup(
    {
      modem_serial: new FormControl(''),
      modem_part: new FormControl(''),
    },
    this.compositePresenceValidator
  );
  typeList: object[] = [];
  loading = true;
  isVisibleTerminalChange = false;
  isChangeComplete = false;
  confirmInfoPaths = [
    'common.car_identification.maker_codes',
    'common.car_identification.models',
    'common.car_identification.type_revs',
    'common.car_identification.serials',
    'car.support_distributor.label',
    'car.komtrax_unit.terminal_component.part',
    'car.komtrax_unit.terminal_component.serial',
    'car.car_identification.initial_smr',
  ];
  listDesc;
  listVal;
  commonHeaderAttr = CommonHeaderAttribute;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected carService: CarService,
    protected api: ApiService,
    protected router: Router
  ) {
    super(nav, title, header);
  }

  /**
   * 共通ヘッダの高さ分のオフセットを返却
   * @return オフセット
   */
  get commonHeaderOffset(): number {
    return -this.commonHeaderAttr.height;
  }

  /**
   * メーカコード変更時コールバック
   * @param makerCode メーカコード
   */
  async onMakerCodeChange(makerCode) {
    const res = await this.carService.fetchModelsByMakerCode(makerCode);
    this.resource.common.car_identification.models =
      res.common.car_identification.models;

    if (this.resource.common.car_identification.models.values.length === 0) {
      this.resource.common.car_identification.models.values.push({
        name: '-',
      });
    }

    await this.modelSelect.refresh();
  }

  /**
   * 機種変更時コールバック
   * @param model 機種
   */
  async onModelChange(model) {
    if (model !== '-') {
      const res = await this.carService.fetchTypesByModel(model);
      this.resource.common.car_identification.type_revs =
        res.common.car_identification.type_revs;

      if (
        this.resource.common.car_identification.type_revs.values.length === 0
      ) {
        this.resource.common.car_identification.type_revs.values.push({
          name: '-',
        });
      }
    } else {
      this.resource.common.car_identification.type_revs.values = [
        {
          name: '-',
        },
      ];
    }

    await this.typeSelect.refresh();
  }

  /**
   * 端末載せ替えへボタン押下時コールバック
   */
  async onClickToTerminalChange(): Promise<any> {
    this.isVisibleTerminalChange = false;
    this.carTerminalChangeForm.markAsPristine();
    this.alertService.close();
    this.errorData = null;
    const res = await this.carService.fetchCarIndexList(
      this._convertParams(this.carSearchParams),
      {
        'X-Count': 1,
      }
    );
    const car = res.result_data.cars[0];
    if (car) {
      this.carId = car.car_identification.id;
      const carIdBelongResource = await this.carService.fetchCarIdBelongResource(
        ScreenCode.terminalChange,
        this.carId
      );

      set(
        this.resource,
        'car.komtrax_unit.terminal_component.part',
        get(carIdBelongResource, 'car.komtrax_unit.terminal_component.part')
      );
      set(
        this.resource,
        'car.komtrax_unit.terminal_component.serial',
        get(carIdBelongResource, 'car.komtrax_unit.terminal_component.serial')
      );
      this.displayData = this._createDisplayData(car);
      this.params = this._createParams(car);
      this.isVisibleTerminalChange = true;
    } else {
      this.alertService.show(this.labels.empty_list_message, true, 'danger');
    }
  }

  /**
   * 変更ボタン押下時コールバック
   */
  onClickSubmit(): void {
    this.listDesc = this._createListDesc(this.confirmInfoPaths, this.resource);
    this.listVal = this._createListVal();

    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.terminalChangeSubmitModalContent,
      ok: () => {
        this.alertService.close();
        this.carService
          .changeTerminal(this.carId, this.params)
          .then(() => {
            this.isChangeComplete = true;
            this.errorData = null;
          })
          .catch(errorData => this._setError(errorData, this.alertService));
      },
    });
  }

  /**
   * 続けて変更ボタン押下時コールバック
   */
  onClickContinue(): void {
    this.isVisibleTerminalChange = false;
    this.isChangeComplete = false;
    this.router.navigateByUrl('cars/terminal/change').then(() => {
      this.makerSelect.reset();
      this.makerSelect.refresh();
      this.carForm.reset();
      this.carTerminalChangeForm.reset();
    });
  }

  /**
   * 複合バリデーション
   * - 端末品番、端末シリアル、初期SMR(H)がすべて空かもしくはすべて入力状態であればOK
   * @param g フォーム
   */
  compositePresenceValidator(formGroup: FormGroup) {
    if (
      every(formGroup.controls, c => isEmpty(c.value)) ||
      every(formGroup.controls, c => !isEmpty(c.value))
    ) {
      return null;
    } else {
      return { composite: true };
    }
  }

  hasError(path: string): boolean {
    return this.errorData
      ? some(this.errorData, data => includes(data.keys, path))
      : false;
  }

  /**
   * 「端末載せ替えへ」の有効制御を行う
   */
  isCarInfoInvalid() {
    const {
      models,
      type_revs,
    } = this.carSearchParams.common.car_identification;

    return models === '-' || type_revs === '-';
  }

  protected async _fetchDataForInitialize(): Promise<any> {
    const res = await this.carService.fetchInitTerminalChange();
    this.carSearchParams = cloneDeep(this.initCarSearchParams);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.loading = false;
  }

  /**
   * 確認モーダルヘッダの作成
   * @param paths リソースパス
   * @param resource リソース
   */
  private _createListDesc(paths: string[], resource) {
    return reduce(
      paths,
      (desc, path) => {
        const name =
          path === 'common.car_identification.maker_codes'
            ? 'common.car_identification.maker_name'
            : path;
        const res = get(resource, path);

        if (res) {
          desc.push({
            label: res.name,
            name: name,
            displayable: true,
          });
        }
        return desc;
      },
      []
    );
  }

  /**
   * 確認モーダル表示用データの作成
   */
  private _createListVal() {
    return merge({}, this.params, this.displayData);
  }

  /**
   * 表示用情報を作成
   * @param car 車両情報
   */
  private _createDisplayData(car): TerminalChangeDisplayData {
    return {
      common: {
        car_identification: {
          maker_name: car.car_identification.maker_name,
          models: car.car_identification.model,
          type_revs: car.car_identification.type_rev,
          serials: car.car_identification.serial,
        },
      },
      car: {
        support_distributor: {
          label: car.support_distributor ? car.support_distributor.label : undefined,
        },
      },
      modem: {
        serial: car.komtrax_unit.main_component.serial,
        part: car.komtrax_unit.main_component.part,
      },
    };
  }

  /**
   * リクエストパラメータを作成
   * @param car 車両情報
   */
  private _createParams(car): TerminalChangeParams {
    return {
      car: {
        komtrax_unit: {
          terminal_component: {
            serial: '',
            part: '',
          },
        },
        car_identification: {
          initial_smr: '',
          update_datetime: car.car_identification.update_datetime,
        },
      },
    };
  }

  /**
   * パラメータを配列形式に変換する
   */
  private _convertParams(params) {
    const {
      common: {
        car_identification: { maker_codes, models, type_revs, serials },
      },
    } = params;

    return {
      common: {
        car_identification: {
          maker_codes: [maker_codes],
          models: [models],
          type_revs: [type_revs],
          serials: [serials],
        },
      },
    };
  }
}
