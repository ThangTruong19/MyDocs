export interface Api {
    result_header: any;
    result_data: any;
}

export interface Resource {
    help: string;
    name: string;
    placeholder_text: string;
    type: number;
    values: ResourceValues;
}

export type ResourceValues = ResourceValue[];

export interface ResourceValue {
    value: string;
    name: string;
    kind: string;
}

interface ScreenLabels {
    [key: string]: string;
}

export type Labels = ScreenLabels & {
    _common?: ScreenLabels;
};

export interface Resources {
    [key: string]: Resources & Resource;
}

export interface ListSelection {
    all?: { label: string; value: string };
    non?: { label: string; value: string };
    selections?: any[];
}

export interface TableHeader {
    name: string;
    label: string;
    sortKey?: string;
    sortable?: boolean;
    displayable?: boolean;
    shortName?: string;
    dataKey?: string;
    columnStyle?: string;

    // 各画面で使用する独自パラメータ用
    [key: string]: any;
}

export interface TableMergeColumn {
    groupByColumns: string[];
    targetColumn: string;
}

export interface TableOptions {
    columnStyles?: string[];
    scrollable?: boolean;
    noOptionTableColumn?: boolean;
}

export interface ModalValues {
    requestHeaderParams: any;
    listDesc: any;
    listVal: any;
}

export interface ModalDescItem {
    label: string;
    name: string;
    displayable?: boolean;
}

export interface InitializeApiResult {
    resource: Resources;
    label: Labels;
    functions: Api;
    [opt: string]: any;
}

export type Fields = Field[];

export interface Field {
    control_code: string;
    display_code: string;
    display_sequence_no: string;
    name: string;
    path: string;
}

export interface SearchModalValues {
    labels?: Labels;
    fields?: Fields;
    resource?: Resources;
}

export interface ApiIdAndParams {
    apiId: string;
    params: string[];
}

export type ApiId = string | ApiIdAndParams;
