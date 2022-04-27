import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

import {
  MonthlyParams,
  DailyParams,
  MonthlyOperations,
  DailyOperations,
  GraphOptions,
  Operation,
} from '../../../../types/flm/site-management';
import { Labels } from '../../../../types/common';

import { ScreenCode } from '../../../../constants/flm/screen-codes/site-management';
import {
  Mode,
  GraphMode,
  GraphType,
  GraphColor,
} from '../../../../constants/flm/site-management';

import { KbaAbstractBaseComponent } from '../../../shared/kba-abstract-component/kba-abstract-base-compoenent';

import {
  KbaStorageService,
  KbaStorageObject,
} from '../../../../services/shared/kba-storage.service';
import { SiteManagementService } from '../../../../services/flm/site-management/site-management.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaMonthPickerService } from '../../../../services/shared/kba-month-picker.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { DateFormat, YearMonthFormat } from '../../../../constants/date-format';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.scss'],
})
export class StatComponent extends KbaAbstractBaseComponent implements OnInit {
  storage: KbaStorageObject;
  screenCode: string;
  url: string;
  idParams: { site_id?: string; area_id?: string };
  graphMode: string;
  graphType: string;
  monthlyParams: MonthlyParams;
  dailyParams: DailyParams;
  monthlyCarOperations: MonthlyOperations;
  dailyCarOperations: DailyOperations;
  graphOptions: {
    headerInfo: {
      icon_font_no: string;
      model: string;
      type_rev: string;
      serial: string;
      customer_car_no: string;
    };
    workTime: GraphOptions;
    fuel?: GraphOptions;
  }[];
  isContentsLoading: boolean;
  listIndex = 0;
  loadCount = 4;
  dateFormat;
  datePickerLabels: Labels;
  isAllCars: boolean;

  GraphType = GraphType;

  /**
   * ヘッダに表示するタイトルを返す
   */
  get headerTitle() {
    if (this.isAllCars) {
      return this.labels.all_cars;
    }
    return (
      _.get(this.monthlyCarOperations, 'site.label') ||
      _.get(this.monthlyCarOperations, 'group_area.label') ||
      _.get(this.dailyCarOperations, 'site.label') ||
      _.get(this.dailyCarOperations, 'group_area.label') ||
      '-'
    );
  }

  /**
   * フッタに表示する情報を返す
   */
  get listCount() {
    if (this.graphMode === GraphMode.monthly && this.monthlyCarOperations) {
      return {
        count: Math.min(this.listIndex, this.monthlyCarOperations.cars.length),
        max: this.monthlyCarOperations.cars.length,
      };
    } else if (this.graphMode === GraphMode.daily && this.dailyCarOperations) {
      return {
        count: Math.min(this.listIndex, this.dailyCarOperations.cars.length),
        max: this.dailyCarOperations.cars.length,
      };
    }

    return {
      count: 0,
      max: 0,
    };
  }

  constructor(
    title: Title,
    storageService: KbaStorageService,
    activatedRoute: ActivatedRoute,
    private siteManagementService: SiteManagementService,
    private header: CommonHeaderService,
    private monthPickerService: KbaMonthPickerService,
    private datePickerService: KbaDatePickerService,
    private ref: ChangeDetectorRef,
    private userSettingService: UserSettingService
  ) {
    super(null, title);

    let id;
    activatedRoute.url.subscribe(paths => (this.url = paths.join('/')));
    activatedRoute.params.subscribe(params => (id = params.id));

    const isSite = /site/.test(this.url);
    this.screenCode = isSite ? ScreenCode.siteStat : ScreenCode.areaStat;
    this.storage = storageService.createStorage(
      `jobsite.site-management.${isSite ? 'site' : 'area'}-stat`
    );
    this.graphMode = this.storage.get('graph-mode') || GraphMode.monthly;
    this.storage.set('graph-mode', this.graphMode);
    this.graphType = this.storage.get('graph-type') || GraphType.time;
    this.storage.set('graph-type', this.graphType);
    this.isAllCars = !id;
    this.idParams = this.isAllCars
      ? {}
      : isSite
      ? { site_id: id }
      : { area_id: id };
    let mode: string;
    if (this.isAllCars) {
      mode = Mode.allCars;
    } else {
      mode = isSite ? Mode.site : Mode.area;
    }

    this.monthlyParams = {
      mode,
      year_month_from: '',
      year_month_to: '',
    };

    this.dailyParams = {
      mode,
      date_from: '',
      date_to: '',
    };
  }

  async ngOnInit() {
    await this._fetchDataForInitialize();
    this.listIndex += this.loadCount;
    this.onLoad();
  }

  /**
   * グラフモード変更時のコールバック
   * @param graphMode グラフモード（月次・日次）
   */
  handleGraphModeChange(graphMode: string) {
    this.graphMode = graphMode;
    this.storage.set('graph-mode', this.graphMode);
  }

  /**
   * グラフ形式変更時のコールバック
   * @param graphType グラフ形式（時間表示・比率表示）
   */
  handleGraphTypeChange(graphType: string) {
    this.graphType = graphType;
    this.storage.set('graph-type', this.graphType);

    if (this.graphMode === GraphMode.monthly) {
      this.graphOptions = this._getMonthlyGraphOptions(this.listIndex);
    } else {
      this.graphOptions = this._getDailyGraphOptions(this.listIndex);
    }
  }

  /**
   * マンスピッカー変更時のコールバック
   * @param yearMonths パラメータ
   */
  async handleYearMonthChange(yearMonths: {
    year_month_from: string;
    year_month_to: string;
  }) {
    this.isContentsLoading = true;
    this.listIndex = this.loadCount;

    this.monthlyParams = {
      ...this.monthlyParams,
      ...yearMonths,
    };
    this.monthlyCarOperations = await this._fetchMonthlyOperations();
    this.graphOptions = this._getMonthlyGraphOptions(this.listIndex);

    this.isContentsLoading = false;
  }

  /**
   * デートピッカー変更時のコールバック
   * @param dates パラメータ
   */
  async handleDateChange(dates: { date_from: string; date_to: string }) {
    this.isContentsLoading = true;
    this.listIndex = this.loadCount;

    this.dailyParams = {
      ...this.dailyParams,
      ...dates,
    };

    this.dailyCarOperations = await this._fetchDailyOperations();
    this.graphOptions = this._getDailyGraphOptions(this.listIndex);

    this.isContentsLoading = false;
  }

  /**
   * もっと見るボタン押下時のコールバック
   */
  handleClickSeeMore() {
    this.listIndex += this.loadCount;
  }

  private async _fetchDataForInitialize() {
    const res = await this.siteManagementService.fetchStatInitData(
      this.screenCode
    );
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    await this.header.setHeader(
      this.labels,
      res.resource,
      res.functions.result_data.functions
    );
    [this.monthlyParams, this.dailyParams] = this._getInitialParams(
      this._getModeParam()
    );
    this.dateFormat = this.userSettingService.userSettings.date_format_code;
  }

  /**
   * 月次稼働情報を取得する
   */
  private async _fetchMonthlyOperations() {
    return <MonthlyOperations>(
      (await this.siteManagementService.fetchMonthlyOperations({
        ...this.idParams,
        ...this.monthlyParams,
      })).result_data
    );
  }

  /**
   * 日次稼働情報を取得する
   */
  private async _fetchDailyOperations() {
    return <DailyOperations>(
      (await this.siteManagementService.fetchDailyOperations({
        ...this.idParams,
        ...this.dailyParams,
      })).result_data
    );
  }

  /**
   * 初期パラメータを取得する
   * @param mode モード
   */
  private _getInitialParams(mode: string): [MonthlyParams, DailyParams] {
    return [
      {
        mode,
        year_month_from: '',
        year_month_to: '',
      },
      {
        mode,
        date_from: '',
        date_to: '',
      },
    ];
  }

  /**
   * 月次グラフのオプションを取得する
   * @param listIndex リストの長さ
   */
  private _getMonthlyGraphOptions(listIndex: number) {
    return this.monthlyCarOperations.cars.map(car => ({
      headerInfo: this._getGraphHeaderInfo(car),
      workTime: this._getWorkTimeGraphOptions(car.operations),
      fuel: this._getFuelGraphOptions(car.operations),
    }));
  }

  /**
   * 日次グラフのオプションを取得する
   * @param listIndex リストの長さ
   */
  private _getDailyGraphOptions(listIndex: number) {
    return this.dailyCarOperations.cars.map(car => ({
      headerInfo: this._getGraphHeaderInfo(car),
      workTime: this._getWorkTimeGraphOptions(car.operations),
      fuel: this._getFuelGraphOptions(car.operations),
    }));
  }

  /**
   * 稼働時間のグラフのオプションを取得する
   * @param operations 稼働状況
   */
  private _getWorkTimeGraphOptions(operations: Operation[]) {
    const columns = [];

    if (this.graphMode === GraphMode.monthly) {
      const fromMonth = moment(this.monthlyParams.year_month_from, YearMonthFormat.hyphen);
      const toMonth = moment(this.monthlyParams.year_month_to, YearMonthFormat.hyphen);

      do {
        columns.push(`0${fromMonth.clone().month() + 1}`.slice(-2));
      } while (fromMonth.add(1, 'months').diff(toMonth) <= 0);
    } else {
      const fromDate = moment(this.dailyParams.date_from, DateFormat.hyphen);
      const toDate = moment(this.dailyParams.date_to, DateFormat.hyphen);

      do {
        columns.push(`0${fromDate.clone().date()}`.slice(-2));
      } while (fromDate.add(1, 'days').diff(toDate) <= 0);
    }

    const realColumns = operations.map(operation => {
      if (this.graphMode === GraphMode.monthly) {
        const format = this.monthPickerService.inputDateFormat(this.dateFormat);
        return `0${moment(operation.year_month, format).month() + 1}`.slice(-2);
      } else {
        const format = this.datePickerService.inputDateFormat(this.dateFormat);
        return `0${moment(operation.date, format).date()}`.slice(-2);
      }
    });
    const data = [];

    switch (this.graphType) {
      case GraphType.time:
        data.push({
          data: columns.map((date: string) => {
            if (realColumns.includes(date)) {
              return operations[realColumns.indexOf(date)].idle_time;
            }

            return null;
          }),
          color: GraphColor.idle,
        });
        data.push({
          data: columns.map((date: string) => {
            if (realColumns.includes(date)) {
              const { actual_operation_time, operation_time } = operations[realColumns.indexOf(date)];
              return actual_operation_time != null ? actual_operation_time : operation_time;
            }

            return null;
          }),
          color: GraphColor.operationTime,
        });
        break;
      case GraphType.rate:
        const tempOperations = operations.map(
          ({ idle_time, actual_operation_time, operation_time }) => {
            const operationTime =
              (actual_operation_time != null ? actual_operation_time : operation_time) || 0;

            return {
              idle_time,
              operationTime,
              total: +operationTime + +(idle_time || 0),
            };
          }
        );
        data.push({
          data: columns.map((date: string) => {
            if (realColumns.includes(date)) {
              const { idle_time, total } = tempOperations[realColumns.indexOf(date)];
              return total === 0 ? 0 : (+idle_time / total) * 100;
            }

            return null;
          }),
          color: GraphColor.idle,
        });
        data.push({
          data: columns.map((date: string) => {
            if (realColumns.includes(date)) {
              const { operationTime, total } = tempOperations[realColumns.indexOf(date)];
              return total === 0 ? 0 : (+operationTime / total) * 100;
            }

            return null;
          }),
          color: GraphColor.operationTime,
        });
        break;
    }

    return {
      columns,
      data,
    };
  }

  /**
   * 消費燃料・電力のグラフのオプションを取得する
   * @param operations 稼働状況
   */
  private _getFuelGraphOptions(operations: Operation[]) {
    if (
      operations.every(
        operation =>
          !(operation.fuel_consumption || operation.consumed_electric_power)
      )
    ) {
      return null;
    }

    const columns = [];

    if (this.graphMode === GraphMode.monthly) {
      const fromMonth = moment(this.monthlyParams.year_month_from, YearMonthFormat.hyphen);
      const toMonth = moment(this.monthlyParams.year_month_to, YearMonthFormat.hyphen);

      do {
        columns.push(`0${fromMonth.clone().month() + 1}`.slice(-2));
      } while (fromMonth.add(1, 'months').diff(toMonth) <= 0);
    } else {
      const fromDate = moment(this.dailyParams.date_from, DateFormat.hyphen);
      const toDate = moment(this.dailyParams.date_to, DateFormat.hyphen);

      do {
        columns.push(`0${fromDate.clone().date()}`.slice(-2));
      } while (fromDate.add(1, 'days').diff(toDate) <= 0);
    }

    const realColumns = operations.map(operation => {
      if (this.graphMode === GraphMode.monthly) {
        const format = this.monthPickerService.inputDateFormat(this.dateFormat);
        return `0${moment(operation.year_month, format).month() + 1}`.slice(-2);
      } else {
        const format = this.datePickerService.inputDateFormat(this.dateFormat);
        return `0${moment(operation.date, format).date()}`.slice(-2);
      }
    });
    const data = [];

    data.push({
      data: columns.map((date: string) => {
        if (realColumns.includes(date)) {
          const { fuel_consumption } = operations[realColumns.indexOf(date)];
          return fuel_consumption;
        }

        return null;
      }),
      color: GraphColor.fuel,
    });
    data.push({
      data: columns.map((date: string) => {
        if (realColumns.includes(date)) {
          const { consumed_electric_power } = operations[realColumns.indexOf(date)];
          return consumed_electric_power;
        }

        return null;
      }),
      color: GraphColor.fuel,
    });

    let label = operations.some(operation => operation.fuel_consumption != null) ? this.labels.fuel_consumption : null;

    if (label == null) {
      label = operations.some(operation => operation.consumed_electric_power != null) ?
        this.labels.consumed_electric_power :
        this.labels.fuel_consumption;
    }

    return {
      columns,
      data,
      label,
    };
  }

  /**
   * グラフのヘッダに表示する情報を取得する
   * @param car 車両
   */
  private _getGraphHeaderInfo(car) {
    const {
      car_identification: { icon_font_no, model, type_rev, serial },
      customer_attribute: { customer_car_no },
    } = car;

    return {
      icon_font_no,
      model,
      type_rev,
      serial,
      customer_car_no,
    };
  }

  /**
   * API にセットするモードの判定
   */
  private _getModeParam(): string {
    if (this.isAllCars) {
      return Mode.allCars;
    }
    return /site/.test(this.url) ? Mode.site : Mode.area;
  }
}
