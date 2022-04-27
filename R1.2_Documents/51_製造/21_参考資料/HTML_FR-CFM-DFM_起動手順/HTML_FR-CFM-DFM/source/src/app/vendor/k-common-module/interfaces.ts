//
// DatePicker & MonthPicker
//
export type MonthLabels = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
]; // length 12の配列

//
// DatePicker
//

export interface CommonDatePickerDay {
  disabled: boolean;
  isToday: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isLastMonth: boolean;
  isNextMonth: boolean;
  YYYYMMDD: string;
  date: number;
}

export interface OnClickDayValues {
  ev: MouseEvent;
  day: CommonDatePickerDay;
}

export interface DatePickerLabels {
  todayButton: string;
  closeButton: string;
  clearButton?: string;
  title: string;
}

export interface DatePickerTitle {
  year: number;
  month: number;
}

//
// MonthPicker
//

export interface CommonMonthPickerMonth {
  disabled: boolean;
  isThisMonth: boolean;
  isSelected: boolean;
  month: number; // 1月は1
}

export interface MonthPickerLabels {
  closeButton: string;
  clearButton?: string;
  title: string;
  months: MonthLabels;
}

export interface OnClickMonthValues {
  ev: MouseEvent;
  monthObj: CommonMonthPickerMonth;
}

//
// Header
//

export interface HeaderItem {
  id: string;
  label: string;
  isEnabled: boolean;
}

export interface HeaderLabels {
  logout?: string;
  managementDropdown?: string;
  configDropdown?: string;
  notification?: string;
  signOutDialogTitle?: string;
  signOutDialogNote?: string;
  signOutDialogButtonCancel?: string;
  signOutDialogButtonSignOut?: string;
}

//
// UserItem
//

export interface UserItems {
  name: string;
  email: string;
  groupName: string;
  links: HeaderItem[];
}

//
// Config
//

export interface FormItem {
  label: string;
  value: string;
}

export interface CommonConfig {
  temperatureUnit?: string;
  dateFormat?: string;
  carDivision?: string;
  locale?: string;
  distanceUnit?: string;
  initialScreen?: string;
}

export interface ConfigItems {
  temperatureUnit?: FormItem[];
  dateFormat?: FormItem[];
  carDivision?: FormItem[];
  locale?: FormItem[];
  distanceUnit?: FormItem[];
  initialScreen?: FormItem[];
}

export interface ConfigLabels {
  localeHead?: string;
  dateFormatHead?: string;
  distanceUnitHead?: string;
  temperatureUnitHead?: string;
  carDivisionHead?: string;
  initialScreenHead?: string;
  submit?: string;
  cancel?: string;
}
