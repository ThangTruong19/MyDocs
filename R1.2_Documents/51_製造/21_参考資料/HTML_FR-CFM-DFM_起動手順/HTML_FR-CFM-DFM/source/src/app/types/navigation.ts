export interface Navigation {
  code: string;
  name: string;
  options: {
    key: string;
    value: string;
  }[];
  functions: Navigation[];
}
