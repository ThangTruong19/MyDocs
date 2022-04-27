export interface ApplyIndexParams {
  common: {
    car_identification: {
      car_ids?: string[] | string;
      maker_codes?: string[] | string;
      division_codes?: string[] | string;
      models?: string[] | string;
      type_revs?: string[] | string;
      serials?: string[] | string;
    };
    support_distributor: {
      ids?: string[] | string;
    };
    service_distributor: {
      ids?: string[] | string;
    };
    customer: {
      ids?: string[] | string;
    };
  };
  service_contract_status?: string;
  service_contract_request: {
    service_distributor_id?: string;
  };
}

export interface CarIdSearchParams {
  common: {
    car_identification: {
      car_ids: string[];
    };
  };
}

export interface ApplyRegistParams {
  service_contract_requests: {
    car: {
      car_identification: {
        id: string;
        update_datetime: string;
      };
    };
    service_distributor_id: string;
    support_distributor_id: string;
    applicant_label: string;
    applicant_email: string;
    free_memo?: string;
  }[];
}

export interface ApproveRejectParams {
  service_contract_request_status: string;
  receive_date_from?: string;
  receive_date_to?: string;
  support_distributor_id?: string;
}

export interface ApproveRejectListData {
  'service_contract_requests.applicant_email': string;
  'service_contract_requests.applicant_label': string;
  'service_contract_requests.car.car_identification.division_name': string;
  'service_contract_requests.car.car_identification.id': string;
  'service_contract_requests.car.car_identification.maker_name': string;
  'service_contract_requests.car.car_identification.model': string;
  'service_contract_requests.car.car_identification.serial': string;
  'service_contract_requests.car.car_identification.type_rev': string;
  'service_contract_requests.car.customer.label': string;
  'service_contract_requests.car.customer.label_english': string;
  'service_contract_requests.car.service_distributor.label': string;
  'service_contract_requests.car.service_distributor.label_english': string;
  'service_contract_requests.car.support_distributor.label': string;
  'service_contract_requests.car.support_distributor.label_english': string;
  'service_contract_requests.free_memo': string;
  'service_contract_requests.id': string;
  'service_contract_requests.receive_datetime': string;
  'service_contract_requests.service_distributor.id': string;
  'service_contract_requests.service_distributor.label': string;
  'service_contract_requests.status': string;
  'service_contract_requests.status_name': string;
}
