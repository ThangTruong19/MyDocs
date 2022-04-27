import { Landmark } from './landmark';
import { RequestHeaderParams } from '../request';
import { CarLatest } from './car';

export interface GroupAreaParams {
  feature: {
    type: string;
    geometry: {
      type: string;
      coordinates?: any;
    };
    properties?: {
      east_west_distance: string;
      north_south_distance: string;
    };
  };
  edit_feature?: {
    geometry: {
      type: string;
      coordinates?: any;
    };
    properties: {
      north_south_distance: string;
      east_west_distance: string;
      color: string;
      type_name: string;
    };
    type: string;
  };
  no: string;
  label: string;
  group_id: string;
  description: string;
  active_status_kind: '0' | '1';
  notification_kind: '0' | '1';
}

export interface GroupAreaCarParams {
  car_area: {
    id?: string;
    no: string;
    label: string;
    description: string;
    update_datetime?: string;
    feature: {
      type: string;
      geometry: {
        type: string;
        coordinates?: any;
      };
      properties?: {
        east_west_distance: string;
        north_south_distance: string;
      };
    };
  };
}

export interface MapDependedHeader {
  other: RequestHeaderParams;
  landmark: RequestHeaderParams;
}

export interface AreaMenu {
  id?: string;
  no: string;
  label: string;
  description: string;
  selectType: string;
  selectTypeLabel: string;
  polyPoints: any;
  rectData: any;
  featureCoordinates?: any[];
  isUpdate: boolean;
  updateDatetime: string | null;
}

export interface Others {
  areas?: Area[];
  landmarks?: Landmark[];
  cars?: CarLatest[];
}

export interface Area {
  id: string;
  label: string;
  no: string;
  description: string;
  feature: {
    coordinates: Coordinate[][];
  };
  edit_feature: {
    properties: {
      north_south_distance: string;
      east_west_distance: string;
      type_name?: string;
    };
    geometry: {
      type: 'Polygon' | 'Point';
      coordinates: Coordinate[][] | Coordinate;
    };
    type: 'Feature';
  };
}

export type PolyPoints = Coordinate[];

export interface RectData {
  centerPoint: Coordinate;
  distance: Distance;
}

export type Coordinate = [number, number];
export type Distance = [number, number];
