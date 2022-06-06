export interface CustomizeDefinitions {
    id?: number;
    name?: string;
    version?: string;
    access_level?: AccessLevel;
    sends_no?: string;
    assumption_data_value?: number;
}

interface AccessLevel {
    id?: string;
    code?: string;
    name?: string;
}