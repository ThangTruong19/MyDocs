export interface CarsSearchParams {
  common: {
    car_identification: {
      maker_codes: string[];
      models: string[];
      type_revs?: string[];
      serials: string[];
    };
  };
}
