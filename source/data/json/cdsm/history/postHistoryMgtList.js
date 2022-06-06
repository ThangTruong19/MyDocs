var validation = require('../../common/validation.js');

module.exports = function (args) {
    var systemErrorData = validation(args.query, 'system_error');
    if (systemErrorData.length > 0) {
        return fail500();
    }

    var from = isNaN(args.header['x-from'])
        ? 1
        : parseInt(args.header['x-from']);
    var count = isNaN(args.header['x-count'])
        ? 0
        : parseInt(args.header['x-count']);
    var sort = args.header['x-sort'] || 'operation_histories.datetime';
    var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
    var loopEnd =
        TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
    var listMock = {
        result_header: {
            'X-From': from,
            'X-Count': count,
            'X-Sort': sort,
            'X-TotalCount': TOTAL,
            'Cache-Control': 'no-cache',
        },
        result_data: {
            operation_histories: [],
        },
    };
    for (var i = from; i <= loopEnd; i++) {
        listMock.result_data.operation_histories.push(createData(i));
    }

    return success(listMock);
};

function createData(i) {
    data = {
        datetime: '2012/09/30 02:00:00',
        group_id: '17929',
        group_label: 'IT 代理店',
        group_label_english: 'IT distributor',
        user_label: '小松太郎',
        category_code: 'LOCK1',
        code: '201839',
        category_name: 'ロック操作',
        name: 'パスワードロック設定',
        model: 'SK714',
        type_rev: 'A12345M0',
        serial: 'A387',
        division_name: 'スキッドステアローダ',
        content: 'パスワードロック設定を行いました。',
        supplementary_informations: [
            {
                code: 'serial',
                name: '機番',
                value: 'A387',
            },
        ],
        app_code: '080c70ec-bc14-422b-9d1f-xxxxxxxxxxxx',
        app_name: 'CFM',
        kind: '1',
        kind_name: 'API操作履歴',
        customize_definition_id: '20230323',
        customize_definition_label: 'KOMTRAX標準日時',
        customize_usage_definition_id: '20230323',
        customize_usage_definition_label: 'KOMTRAX標準',
    };
    return data;
}

function success(data) {
    return {
        status: 200,
        json: {
            result_data: data.result_data,
        },
        header: data.result_header,
    };
}

function fail(msg) {
    return {
        status: 400,
        json: {
            error_data: [
                {
                    code: 'ERR0001',
                    message: msg,
                    keys: '???',
                },
            ],
        },
    };
}

function fail500() {
    return {
        status: 500,
        json: {
            error_data: [
                {
                    code: 'ACOM0001F',
                    message: 'システムエラーが発生しております。',
                    keys: [],
                },
            ],
        },
    };
}
