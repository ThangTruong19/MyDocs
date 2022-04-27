import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import * as _ from 'lodash';

import {
  GroupAreaParams,
  Area,
  PolyPoints,
  RectData,
  Coordinate,
  MapDependedHeader,
} from '../../../types/flm/group-area';
import { Api, Fields } from '../../../types/common';
import { GroupAreaCarParams, AreaMenu } from '../../../types/flm/group-area';
import { RequestHeaderParams } from '../../../types/request';

import { ScreenCode } from '../../../constants/flm/screen-codes/area-management';
import { FunctionCode } from '../../../constants/flm/function-codes/area-management';
import { AreaType, AccessType } from '../../../constants/flm/group-area';
import { Apis } from '../../../constants/apis';
import { FunctionCode as LandmarkFunctionCode } from '../../../constants/flm/function-codes/landmark-management';

import { ApiService } from '../../api/api.service';
import { LandmarkService } from '../landmark/landmark.service';
import { ResourceService } from '../../api/resource.service';
import { CarService } from '../car/car.service';

@Injectable()
export class GroupAreaService {
  constructor(
    private api: ApiService,
    private landmark: LandmarkService,
    private resource: ResourceService,
    private car: CarService
  ) { }

  /**
   * グループエリア管理 グループエリア一覧画面
   */
  fetchGroupAreaInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchGroupAreaInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
        updatable: Apis.putAreas_groupAreaId_,
        deletable: Apis.deleteAreas_groupAreaId_,
        deleteFields: () =>
          this.api.fetchFields(FunctionCode.listDeleteFunction),
        otherFields: () => this.api.fetchFields(FunctionCode.listMapFunction),
        landmarkFields: () =>
          this.api.fetchFields(LandmarkFunctionCode.listMapFunction),
        carIconFields: () =>
          this.api.fetchFields(FunctionCode.carIconFunction),
      }
    );
  }

  /**
   * エリア登録の初期表示に必要な情報を取得
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew', {
      otherFields: () => this.api.fetchFields(FunctionCode.listMapFunction),
      landmarkFields: () =>
        this.api.fetchFields(LandmarkFunctionCode.listMapFunction),
      carIconFields: () =>
        this.api.fetchFields(FunctionCode.carIconFunction),
    });
  }

  /**
   * 車両毎エリア一覧の初期表示に必要な情報を取得
   */
  fetchGroupAreaCarInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.carList;
    return this.api.callApisForInitialize(
      ScreenCode.carList,
      'fetchGroupAreaCarInitData',
      {
        updatable: Apis.putCars_carId_Areas_carAreaId_,
        deletable: Apis.deleteCars_carId_Areas_carAreaId_,
        fields: () => this.api.fetchFields(FunctionCode.carListFunction),
        // fieldResources: () =>
        //   this.api.fetchFieldResources(FunctionCode.carListFunction),
        searchCondition: () =>
          this.api.fetchSearchCondition(ScreenCode.carList),
        // mapFields: () => this.api.fetchFields(FunctionCode.carListMapFunction),
      }
    );
  }

  /**
   * エリア変更の初期表示に必要な情報を取得
   * @return {Object} 初期パラメータ群
   */
  fetchEditInitData(id: string, groupId: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        groupArea: () => this._fetchGroupAreaDetail(id, groupId),
        otherFields: () => this.api.fetchFields(FunctionCode.listMapFunction),
        landmarkFields: () =>
          this.api.fetchFields(LandmarkFunctionCode.listMapFunction),
        carIconFields: () =>
          this.api.fetchFields(FunctionCode.carIconFunction),
      }
    );
  }

  /**
   * 車両毎エリア変更の初期表示に必要な情報を取得
   * @param carId 車両ID
   * @return 初期パラメータ群
   */
  fetchCarEditInitData(carId: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.carEdit;
    return this.api.callApisForInitialize(
      ScreenCode.carEdit,
      'fetchCarEditInitData',
      {
        groupAreaCar: () =>
          this.api
            .get(
              {
                apiId: Apis.getCars_carId_Areas,
                params: [carId],
              },
              { access_type: AccessType.EDIT }
            )
            .pipe(map(res => res.result_data)),
        carLatest: () =>
          this.api
            .get(
              {
                apiId: Apis.getCars_carId_Latest,
                params: [carId],
              },
              {}
            )
            .pipe(map(res => res.result_data)),
        deleteFields: () =>
          this.api.fetchFields(FunctionCode.carEditDeleteFunction),
      }
    );
  }

  /**
   * エリア情報一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchIndexList(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGroupAreaIndexList',
        this.api
          .get(Apis.getAreas, params, {
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
   * 車両毎エリア一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCarIndexList(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGroupAreaCarIndexList',
        this.api
          .post(Apis.postCarsAreasSearch, params, {
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
   * グループエリア削除APIリクエスト
   * @param areaId エリアID
   * @param params パラメータ
   */
  deleteGroupArea(areaId: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteGroupArea',
        this.api
          .delete(
            {
              apiId: Apis.deleteAreas_groupAreaId_,
              params: [areaId],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループエリア登録APIリクエスト
   * @param params パラメータ
   */
  createGroupArea(params: GroupAreaParams): Promise<any> {
    const p = { group_area: params };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createGroupArea',
        this.api
          .post(Apis.postAreas, p)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * グループエリア変更APIリクエスト
   * @param areaId エリアID
   * @param params パラメータ
   */
  updateGroupArea(areaId: string, params: GroupAreaParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateGroupArea',
        this.api
          .put(
            {
              apiId: Apis.putAreas_groupAreaId_,
              params: [areaId],
            },
            { group_area: params }
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * オプション更新用APIリクエスト
   * @param areaId エリアID
   * @param params リクエストパラメータ
   * @param name オプション名
   * @param value オプションの値
   */
  updateOption(
    areaId: string,
    params: any,
    name: string,
    value: string
  ): Promise<any> {
    params = _.set(params, name, value);

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateOption',
        this.api
          .put(
            {
              apiId: Apis.putAreas_groupAreaId_,
              params: [areaId],
            },
            { group_area: params.group_areas }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 車両エリア取得APIリクエスト
   * @param carId 車両ID
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCarArea(
    carId: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarArea',
        this.api
          .get(
            {
              apiId: Apis.getCars_carId_Areas,
              params: [carId],
            },
            { access_type: AccessType.EDIT },
            { request_header: requestHeaderParams }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 車両毎エリア取得(車両エリア取得, 車両最新情報取得)APIリクエスト
   * @param carId 車両ID
   * @param requestHeaderParams ヘッダ情報
   */
  fetchGroupAreaCar(
    carId: string,
    requestHeaderParams: RequestHeaderParams,
    requiresCar = true
  ): Promise<any> {
    return Promise.all([
      this.fetchCarArea(carId, requestHeaderParams),
      requiresCar ? this.car.fetchCarLatest(carId) : null,
    ]).then(res => {
      return Promise.resolve({
        areas: res[0] ? res[0].result_data.car.car_areas : null,
        car: res[1] ? res[1].result_data.car : null,
      });
    });
  }

  /**
   * 車両毎エリア登録APIリクエスト
   * @param carId 車両ID
   * @param params パラメータ
   */
  createGroupAreaCar(carId: string, params: GroupAreaCarParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createGroupAreaCar',
        this.api
          .post(
            {
              apiId: Apis.postCars_carId_Areas,
              params: [carId],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 車両毎エリア更新APIリクエスト
   * @param carId 車両ID
   * @param carAreaId 車両毎エリアID
   * @param params パラメータ
   */
  updateGroupAreaCar(
    carId: string,
    carAreaId: string,
    params: GroupAreaCarParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateGroupAreaCar',
        this.api
          .put(
            {
              apiId: Apis.putCars_carId_Areas_carAreaId_,
              params: [carId, carAreaId],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 車両毎エリア削除APIリクエスト
   * @param carId 車両ID
   * @param carAreaId 車両毎エリアID
   * @param updateDatetime 更新日時
   */
  deleteGroupAreaCar(
    carId: string,
    carAreaId: string,
    updateDatetime: string
  ): Promise<any> {
    const params = {
      update_datetime: updateDatetime,
    };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteGroupAreaCar',
        this.api
          .delete(
            {
              apiId: Apis.deleteCars_carId_Areas_carAreaId_,
              params: [carId, carAreaId],
            },
            params
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 車両毎エリア一覧 ID入力の検索条件を更新
   * @param params APIパラメータ
   */
  updateCarSearchCondition(params: any) {
    return this.api.updateSearchCondition(ScreenCode.carList, params);
  }

  /**
   * 車両毎エリア一覧 ID入力の検索条件を初期化
   */
  initCarSearchCondition() {
    return this.api.initSearchCondition(ScreenCode.carList);
  }

  /**
   * エリア登録依存データ（登録済みエリア情報、ランドマーク、未登録No）取得用APIリクエスト
   * @param groupId グループID
   * @param mapDependedHeader マップに依存するAPI用のヘッダ情報
   * @param hasGroupIdResource グループIDのリソースが存在しない場合、エリアNoのリソースの取得を行わない
   * @param carGroupPath 車両一覧取得時に指定するグループ（顧客・代理店）のパス
   */
  fetchDepended(
    params: {
      groupId: string,
      mapDependedHeader: MapDependedHeader,
      hasGroupIdResource: boolean,
      requestCars: boolean,
      carIconRequstHeader?: any,
      carGroupPath?: string | undefined
    }
  ) {
    const {
      groupId,
      mapDependedHeader,
      carIconRequstHeader,
      hasGroupIdResource,
      requestCars,
      carGroupPath,
    } = params;

    return Promise.all([
      this.fetchIndexList(
        { group_id: groupId, access_type: '1' },
        mapDependedHeader.other
      ),
      this.landmark.fetchIndexList(
        { group_id: hasGroupIdResource ? groupId : null, editable_kind: '1' },
        mapDependedHeader.landmark
      ),
      this.fetchAvailableNo(groupId),
      requestCars ?
        this.fetchCars(carIconRequstHeader, carGroupPath ? _.set({}, carGroupPath, [groupId]) : null) :
        Promise.resolve(),
    ]).then(res => {
      return Promise.resolve({
        areas: res[0] ? res[0].result_data.group_areas : null,
        landmarks: res[1] ? res[1].result_data.landmarks : null,
        areaNumbers: res[2] ? this.resource.parse(res[2].result_data) : null,
        cars: requestCars && res[3] ? res[3].result_data.cars : null,
      });
    });
  }

  /**
   * 車両一覧取得
   */
  fetchCars(requestHeaderParams: any, params?: any) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchCars',
        this.api
          .post(Apis.postCarsSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 選択可能なグループエリアNo取得API
   * @param groupId グループID
   */
  fetchAvailableNo(groupId: string): Promise<any> {
    if (!groupId) {
      return Promise.resolve(null);
    }

    const params = {
      screen_code: ScreenCode.regist,
      search_parameters: [
        {
          condition_sets: [
            {
              values: [groupId],
              condition: 'group_area.group_id',
            },
          ],
          resource_path: 'group_area.no',
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchAvailableNo',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 担当DBに対応する車両所属リソースの取得API
   * @param supportDistributorIds 担当DBのID
   */
  getBelongResource(
    supportDistributorIds: string[],
    belongResourcePaths: string[]
  ): Promise<any> {
    const params = _.map(belongResourcePaths, path => {
      return {
        resource_path: path,
        condition_sets: [
          {
            values: supportDistributorIds,
            condition: 'common.support_distributor.ids',
          },
        ],
      };
    });
    return this._fetchResource('getBelongResource', params);
  }

  /**
   * サービスDBに対応するサービスDB組織コードリソースの取得API
   * @param serviceDbId サービスDBのID
   */
  getServiceDbOrgCode(serviceDbId: string): Promise<any> {
    const params = [
      {
        resource_path: 'common.service_distributor.organization_codes',
        condition_sets: [
          {
            values: [serviceDbId],
            condition: 'common.service_distributor.ids',
          },
        ],
      },
    ];

    return this._fetchResource('getServiceDbOrgCode', params);
  }

  /**
   * サービスDB組織コードに対応するサービスDBリソースの取得API
   * @param serviceDbId サービスDB組織コード
   */
  getServiceDb(serviceDbOrgCode: string): Promise<any> {
    const params = [
      {
        resource_path: 'common.service_distributor.ids',
        condition_sets: [
          {
            values: [serviceDbOrgCode],
            condition: 'common.service_distributor.organization_codes',
          },
        ],
      },
    ];

    return this._fetchResource('getServiceDb', params);
  }

  /**
   * 車両毎エリア取得APIで取得した車両情報をエリア選択メニュー情報へ変換し、
   * 1〜最大Noまでのエリアのうち未登録のものを空情報で埋める
   * @param maxNo 最大No
   * @param areas 車両情報
   * @param defaultTypeLabel デフォルトのタイプ名（多角形 or 中心点+幅）
   */
  createFilledAreaMenu(
    maxNo: number,
    areas: Area[],
    defaultTypeLabel: string
  ): AreaMenu[] {
    const areaMenu = this.createAreaMenu(areas);
    const noSlot: number[] = [];
    for (let i = 1; i <= maxNo; i++) {
      noSlot.push(i);
    }

    return noSlot.map(no => {
      const area = _.find(areaMenu, a => no === a.no);
      if (area) {
        return area;
      } else {
        return {
          no: no,
          label: '',
          menuLabel: no,
          description: '',
          selectType: AreaType.polygon,
          selectTypeLabel: defaultTypeLabel,
          polyPoints: [],
          rectData: { centerPoint: [null, null], distance: [null, null] },
          isUpdate: false,
          updateDatetime: null,
        };
      }
    });
  }

  /**
   * 車両毎エリア取得APIで取得したエリア情報をエリア選択メニュー情報へ変換
   * @param areas エリア情報
   */
  createAreaMenu(areas: Area[]): AreaMenu[] {
    return _.reduce(
      areas,
      (result, area) => {
        const menuData = {
          id: area.id,
          no: area.no,
          label: area.label,
          menuLabel: `${area.no}[${area.label}]`,
          description: area.description,
          selectType: area.edit_feature.geometry.type,
          selectTypeLabel: area.edit_feature.properties.type_name,
          polyPoints: [],
          rectData: { centerPoint: [null, null], distance: [null, null] },
          featureCoordinates: area.feature.geometry.coordinates[0],
          isUpdate: true,
          updateDatetime: area.update_datetime,
        };
        if (menuData.selectType === AreaType.polygon) {
          menuData.polyPoints = this._createPolyPoint(area);
        } else if (menuData.selectType === AreaType.point) {
          menuData.rectData = this._createRectData(area);
        }
        result.push(menuData);
        return result;
      },
      []
    );
  }

  /**
   * 登録画面のリソースを再取得する
   */
  fetchRegistResource() {
    return new Promise((resolve, reject) => {
      this.api
        .fetchResource(ScreenCode.regist)
        .subscribe(res => resolve(res), error => reject(error));
    });
  }

  /**
   * 車両毎エリア一覧/MAP用指定項目取得
   */
  fetchCarIndexMapFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchCarIndexMapFields',
        this.api
          .fetchFields(FunctionCode.carListMapFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 車両毎エリア一覧/指定項目リソース取得
   */
  fetchCarIndexFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchCarIndexFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.carListFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループエリア取得APIリクエスト
   */
  private _fetchGroupAreaDetail(id: string, groupId: string): Observable<Api> {
    return this.api
      .get(Apis.getAreas, {
        area_id: id,
        access_type: AccessType.EDIT,
        group_id: groupId,
      })
      .pipe(
        map(res => {
          return res.result_data.group_areas[0];
        })
      );
  }

  /**
   * リソース取得APIリクエスト
   * @param requestName リクエスト名
   * @param searchParameters 検索パラメータ
   */
  private _fetchResource(requestName: string, searchParameters): Promise<any> {
    const params = {
      screen_code: ScreenCode.carList,
      search_parameters: searchParameters,
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        requestName,
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(res => {
            resolve(this.resource.parse(res.result_data));
          })
      );
    });
  }

  /**
   * 車両毎エリア取得APIで取得した車両毎エリア情報から多角形マップデータを取得
   * @param area 車両毎エリア情報
   * @return 多角形マップデータ
   */
  private _createPolyPoint(area: Area): PolyPoints {
    const points = <PolyPoints>area.edit_feature.geometry.coordinates[0];
    return _.take(points, points.length - 1);
  }

  /**
   * 車両毎エリア取得APIで取得した車両毎エリア情報から中心点+幅マップデータを取得
   * @param area 車両毎エリア情報
   * @return 中心点+幅マップデータ
   */
  private _createRectData(area: Area): RectData {
    return {
      centerPoint: [
        (<Coordinate>area.edit_feature.geometry.coordinates)[0],
        (<Coordinate>area.edit_feature.geometry.coordinates)[1],
      ],
      distance: [
        +area.edit_feature.properties.east_west_distance,
        +area.edit_feature.properties.north_south_distance,
      ],
    };
  }
}
