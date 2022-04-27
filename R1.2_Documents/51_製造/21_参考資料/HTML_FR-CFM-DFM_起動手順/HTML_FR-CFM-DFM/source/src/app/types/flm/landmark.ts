export interface Landmark {
  update_datetime: string;
  id: string;
  label: string;
  icon: LandmarkIconParams;
  point: {
    coordinates: number[];
    type: string;
  };
  group: {
    label_english: string;
    label: string;
    id: string;
  };
  free_memo: string;
  publish_kind: string;
  publish_name: string;
}

export interface LandmarkParams<T> {
  landmark: {
    label: string;
    icon_id: string;
    point: {
      type: string;
      coordinates: T;
    };
    group_id?: string;
    free_memo?: string;
    publish_kind?: '0' | '1';
  };
}

export interface LandmarkIconParams {
  id?: string;
  image: string;
  name?: string;
}

export interface Coordinates<T> {
  lng?: T;
  lat?: T;
}

export interface LandmarkMapParams {
  icon?: LandmarkIconParams;
  coordinates?: Coordinates<number>;
}

export interface LandmarIndexParams {
  group_id?: string;
  landmark_id?: string;
  landmark_label?: string;
  editable_kind?: '0' | '1';
}
