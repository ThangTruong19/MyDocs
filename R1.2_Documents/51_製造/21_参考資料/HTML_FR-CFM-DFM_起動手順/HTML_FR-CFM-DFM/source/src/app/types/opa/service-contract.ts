export interface ServiceContractIndexParams {
  block_id?: string;
  common: {
    support_distributor: {
      ids?: string[];
    };
    service_distributor: {
      ids?: string[];
    };
    customer: {
      ids?: string[];
    };
    car_identification: {
      division_ids?: string[];
      maker_ids?: string[];
      models?: string[];
      type_revs?: string[];
      serials?: string[];
    };
  };
}

export interface ServiceContractEditParams {
  cars: {
    id: string;
    service_distributor_id: string;
    update_datetime: string;
  }[];
}

export interface CarIdSearchParams {
  common: {
    car_identification: {
      car_ids: string[];
    };
  };
}
