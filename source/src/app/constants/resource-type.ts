export class ResourceType {
    static tNumUpper = '-15'; // テキストボックス(数値上限)
    static tNumLower = '-14'; // テキストボックス(数値下限)
    static tNumRange = '-13'; // テキストボックス(数値範囲)
    static tDateRange = '-12'; // テキストボックス(日付範囲)
    static tYearMonthRange = '-11'; // テキストボックス(年月範囲)
    static tText = '-10'; // テキストボックス(テキスト)
    static tDate = '-16'; // テキストボックス(日付)
    static tYearMonth = '-17'; // テキストボックス(年月)
    static tTimeRange = '-18'; // テキストボックス(時間範囲)
    static tArray = '-19'; // テキストボックス(配列)
    static pulldown = '10'; // プルダウン
    static radio = '20'; // ラジオボタン
    static check = '30'; // チェックボックス
}

export class ResourceKind {
    static all = 'A';
    static nothing = 'N';
    static global = 'D';
    static highlight = 'M';
}
