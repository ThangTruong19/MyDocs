export interface CarAssignsSearchParams {
  assigned_group_id: string;
  models?: string | string[];
  type_revs?: string | string[];
  serials?: string | string[];
}

export interface CarAssignsParams {
  car_assigns: { id: string; update_datetime: string }[];
}

export interface SupportDistributorChangeConsignorSearchParams {
  common?: {
    support_distributor?: {
      ids?: string[] | string;
    };
    service_distributor?: {
      ids?: string[] | string;
    };
    customer?: {
      ids?: string[] | string;
    };
    car_identification?: {
      division_codes?: string[] | string;
      maker_codes?: string[] | string;
      models?: string[] | string;
      serials?: string[] | string;
      type_revs?: string[] | string;
    };
  };
  car_management?: {
    car_assign_statuses?: string[];
  };
}

export interface SupportDistributorChangeConsignorParams {
  cars: {
    change_support_distributor_id: string;
    car_id: string;
  }[];
}
