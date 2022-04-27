export type SearchItems = SearchItem[];

export interface SearchItem {
  path: string;
  value: string[];
}

export interface CompanyParams {
  identification: {
    address: string;
    code: string;
    id: string;
    label: string;
    label_english: string;
    nation_code: string;
    nation_name: string;
    organization_code: string;
    phone_no: string;
    postalcode: string;
  };
}
