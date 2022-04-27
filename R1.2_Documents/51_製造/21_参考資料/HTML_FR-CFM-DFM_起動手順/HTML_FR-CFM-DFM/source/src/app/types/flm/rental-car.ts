export interface RentalCar {
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
  rental: {
    reservation1: {
      connection_id: string;
      customer_id: string;
      customer_label: string;
      customer_label_english: string;
      start_date: string;
      end_date: string;
      viewable_connection_id: string;
      viewable_end_date: string;
    };
    reservation2: {
      connection_id: string;
      customer_id: string;
      customer_label: string;
      customer_label_english: string;
      start_date: string;
      end_date: string;
      viewable_connection_id: string;
      viewable_end_date: string;
    };
  };
}

export interface UpdateParams {
  car: {
    car_identification: {
      update_datetime: string;
    };
    rental: {
      reservation1: {
        connection_id?: string;
        customer_id?: string;
        start_date?: string;
        start_date_display?: string;
        end_date?: string;
        end_date_display?: string;
        viewable_connection_id?: string;
        viewable_end_date?: string;
        viewable_end_date_display?: string;
      };
      reservation2: {
        connection_id?: string;
        customer_id?: string;
        start_date?: string;
        start_date_display?: string;
        end_date?: string;
        end_date_display?: string;
        viewable_connection_id?: string;
        viewable_end_date?: string;
        viewable_end_date_display?: string;
      };
    };
  };
}
