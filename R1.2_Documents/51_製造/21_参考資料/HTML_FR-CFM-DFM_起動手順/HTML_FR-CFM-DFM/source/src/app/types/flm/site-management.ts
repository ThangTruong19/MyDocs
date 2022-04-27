export interface SiteMap {
  id: string;
  label: string;
  group_id: string;
  group_label: string;
  group_label_english: string;
  start_datetime: string;
  end_datetime: string;
  cars: {
    car_identification: {
      id: string;
      maker_id: string;
      maker_code: string;
      maker_name: string;
      division_id: string;
      division_name: string;
      model_id: string;
      model: string;
      model_type_id: string;
      type: string;
      rev: string;
      type_rev: string;
      icon_font_no: string;
      serial: string;
      pin: string;
      production_date: string;
      initial_smr: string;
      update_datetime: string;
    };
    customer: {
      id: string;
      label: string;
      label_english: string;
      organization_code: string;
      business_type_id: string;
      business_type_name: string;
      phone_no: string;
      address: string;
    };
    customer_attribute: {
      operator_label1: string;
      operator_label2: string;
      operator_label3: string;
      mainte_in_charge: string;
      remarks: string;
      user_memo: string;
      customer_car_no: string;
      customer_management_no: string;
    };
    latest_status: {
      point: {
        type: string;
        coordinates: [number, number];
      };
    };
    icon_font: {
      no: string;
      id: string;
      color: string;
    };
  }[];
}

export interface GroupAreaMap {
  id: string;
  label: string;
  no: string;
  group_id: string;
  group_label: string;
  group_label_english: string;
  description: string;
  feature: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    properties: {
      color: string;
      type_name: string;
    };
  };
  cars: {
    car_identification: {
      id: string;
      maker_id: string;
      maker_code: string;
      maker_name: string;
      division_id: string;
      division_name: string;
      model_id: string;
      model: string;
      model_type_id: string;
      type: string;
      rev: string;
      type_rev: string;
      icon_font_no: string;
      serial: string;
      pin: string;
      production_date: string;
      initial_smr: string;
      update_datetime: string;
    };
    customer: {
      id: string;
      label: string;
      label_english: string;
      organization_code: string;
      business_type_id: string;
      business_type_name: string;
      phone_no: string;
      address: string;
    };
    customer_attribute: {
      operator_label1: string;
      operator_label2: string;
      operator_label3: string;
      mainte_in_charge: string;
      remarks: string;
      user_memo: string;
      customer_car_no: string;
      customer_management_no: string;
    };
    latest_status: {
      point: {
        type: string;
        coordinates: [number, number];
      };
    };
    icon_font: {
      no: string;
      id: string;
      color: string;
    };
  }[];
}

export interface MonthlyOperations {
  group_area?: {
    id: string;
    label: string;
    no: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    description: string;
  };
  site?: {
    id: string;
    label: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    start_datetime: string;
    end_datetime: string;
  };
  cars: {
    car_identification: {
      id: string;
      maker_id: string;
      maker_code: string;
      maker_name: string;
      division_id: string;
      division_code: string;
      division_name: string;
      model_id: string;
      model: string;
      model_type_id: string;
      type: string;
      rev: string;
      type_rev: string;
      icon_font_no: string;
      serial: string;
      pin: string;
      production_date: string;
      initial_smr: string;
      update_datetime: string;
    };
    customer: {
      id: string;
      label: string;
      label_english: string;
      organization_code: string;
      business_type_id: string;
      business_type_name: string;
      phone_no: string;
      address: string;
    };
    customer_attribute: {
      operator_label1: string;
      operator_label2: string;
      operator_label3: string;
      mainte_in_charge: string;
      remarks: string;
      user_memo: string;
      customer_car_no: string;
      customer_management_no: string;
    };
    operations: Operation[];
  }[];
}

export interface DailyOperations {
  group_area?: {
    id: string;
    label: string;
    no: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    description: string;
  };
  site?: {
    id: string;
    label: string;
    group_id: string;
    group_label: string;
    group_label_english: string;
    start_datetime: string;
    end_datetime: string;
  };
  cars: {
    car_identification: {
      id: string;
      maker_id: string;
      maker_code: string;
      maker_name: string;
      division_id: string;
      division_code: string;
      division_name: string;
      model_id: string;
      model: string;
      model_type_id: string;
      type: string;
      rev: string;
      type_rev: string;
      icon_font_no: string;
      serial: string;
      pin: string;
      production_date: string;
      initial_smr: string;
      update_datetime: string;
    };
    customer: {
      id: string;
      label: string;
      label_english: string;
      organization_code: string;
      business_type_id: string;
      business_type_name: string;
      phone_no: string;
      address: string;
    };
    customer_attribute: {
      operator_label1: string;
      operator_label2: string;
      operator_label3: string;
      mainte_in_charge: string;
      remarks: string;
      user_memo: string;
      customer_car_no: string;
      customer_management_no: string;
    };
    operations: Operation[];
  }[];
}

export interface MonthlyParams {
  mode: string;
  area_id?: string;
  site_id?: string;
  year_month_from: string;
  year_month_to: string;
}

export interface DailyParams {
  mode: string;
  area_id?: string;
  site_id?: string;
  date_from: string;
  date_to: string;
}

export interface GraphOptions {
  data: {
    data: number[];
    color: string;
  }[];
  columns: (string | number)[];
  max?: number;
  label?: string;
}

export interface Operation {
  date?: string;
  year_month?: string;
  operation_time: number;
  actual_operation_time: number;
  idle_time: number;
  fuel_consumption: number;
  consumed_electric_power: number;
}

export interface BondArea {
  id: string;
  no: string;
  label: string;
  description: string;
  group_id: string;
  group_label: string;
  group_label_english: string;
  feature: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
    properties: {
      color: string;
      type_name: string;
    };
  };
  update_datetime: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
