export class DateTimeFormatKind {
    static yearFirst = '0'; // YYYY/MM/DD hh:mm:ss
    static monthFirst = '1'; // MM/DD/YYYY hh:mm:ss
    static dayFirst = '2'; // DD/MM/YYYY hh:mm:ss
    static withTimeZone = '3'; // YYYY-MM-DDThh:mm:ssZ
}

export class DateFormat {
    static params = 'YYYYMMDD';
    static hyphen = 'YYYY-MM-DD';
    static slash = 'YYYY/MM/DD';
    static slashMonthFirst = 'MM/DD/YYYY';
    static slashDayFirst = 'DD/MM/YYYY';
}

export class YearMonthFormat {
    static hyphen = 'YYYY-MM';
    static slash = 'YYYY/MM';
    static slashMonthFirst = 'MM/YYYY';
}

export class DateTimeFormat {
    static hyphen = 'YYYY-MM-DDTHH:mm:ss[Z]';
    static slash = 'YYYY/MM/DD HH:mm:ss';
    static slashMonthFirst = 'MM/DD/YYYY HH:mm:ss';
    static slashDayFirst = 'DD/MM/YYYY HH:mm:ss';
    static slashDateTimeMilliseconds = 'YYYY/MM/DD HH:mm:ss.SSS';
}
