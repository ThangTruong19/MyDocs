export interface Division {
  division_code?: string;
  maker_code?: string;
  model?: string;
  type_rev?: string;
}

export interface DivisionList {
  [carType: string]: {
    model?: string;
    divisions: Division[];
  }[];
}

export interface SelectedDivisions {
  [carType: string]: Division[];
}

export interface ModelRevParams {
  modelSelectType: string;
  division?: string;
  groupId?: string;
  support_distributor_id?: string;
}
