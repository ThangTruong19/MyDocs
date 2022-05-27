var validation = require('../../common/validation.js');

module.exports = function (data) {
    var systemErrorData = validation(data.query, 'system_error');
    if (systemErrorData.length > 0) {
        return fail500();
    }

    var from = isNaN(data.header['x-from']) ? 1 : parseInt(data.header['x-from']);
    var count = isNaN(data.header['x-count'])
        ? 0
        : parseInt(data.header['x-count']);
    var sort = data.header['x-sort'] || 'car_customized_definition.customize_definition_id';
    var TOTAL = isNaN(data.header['x-count']) ? 1 : 12;
    var mock = {
        result_header: {
            'X-From': from,
            'X-Count': count,
            'X-Sort': sort,
            'X-TotalCount': TOTAL,
            'Cache-Control': 'no-cache',
        },
        result_data: {},
    };

    var customizeDefinitionId = data.query.customize_definition_id;

    mock.result_data = createData(customizeDefinitionId);

    return success(mock);
    // return fail500();
};

function createData(definitionId) {
    const initResult = [];
    let result = {};

    initResult.push({
        "car_customized_definition": {
            "customize_definition_id": 1,
            "customize_definition_name": "アプリUDO 1",
            "assumption_data_value": "1234",
            "car_customize_data_performances": [
                {
                    "send_no": "20200619T091709Z002002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200719T091709Z002002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200819T091709Z002002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-05-12 08:25:05",
                            "car_data_creation_time": "2022-05-12 20:05:15"
                        }]
                },
                {
                    "send_no": "20200919T091709Z002002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201019T091709Z002002",
                    "status": "0",
                    "status_name": "受信済み",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201119T091709Z002002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200619T091709Z002002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200719T091709Z002002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200819T091709Z002002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-05-12 08:25:05",
                            "car_data_creation_time": "2022-05-12 20:05:15"
                        }]
                },
                {
                    "send_no": "20200919T091709Z002002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201019T091709Z002002",
                    "status": "0",
                    "status_name": "受信済み",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201119T091709Z002002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                }
            ]
        }
    });

    initResult.push({
        "car_customized_definition": {
            "customize_definition_id": 2,
            "customize_definition_name": "アプリUDO 2",
            "assumption_data_value": "5678",
            "car_customize_data_performances": [
                {
                    "send_no": "20200720T091709Z003002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-05-12 08:25:05",
                            "car_data_creation_time": "2022-05-12 20:05:15"
                        }]
                },
                {
                    "send_no": "20200820T091709Z003002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200920T091709Z003002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201020T091709Z003002",
                    "status": "0",
                    "status_name": "受信済み",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201120T091709Z003002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201220T091709Z003002",
                    "status": "0",
                    "status_name": "受信済み",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200720T091709Z003002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-05-12 08:25:05",
                            "car_data_creation_time": "2022-05-12 20:05:15"
                        }]
                },
                {
                    "send_no": "20200820T091709Z003002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200920T091709Z003002",
                    "status": "0",
                    "status_name": "要求中",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201020T091709Z003002",
                    "status": "0",
                    "status_name": "受信済み",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201120T091709Z003002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201220T091709Z003002",
                    "status": "0",
                    "status_name": "受信済み",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                }
            ]
        }
    });

    initResult.push({
        "car_customized_definition": {
            "customize_definition_id": 3,
            "customize_definition_name": "アプリUDO 3",
            "assumption_data_value": "9012",
            "car_customize_data_performances": [
                {
                    "send_no": "20200821T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200921T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-05-12 08:25:05",
                            "car_data_creation_time": "2022-05-12 20:05:15"
                        }]
                },
                {
                    "send_no": "20201021T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201121T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201221T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201222T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200821T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20200921T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-05-12 08:25:05",
                            "car_data_creation_time": "2022-05-12 20:05:15"
                        }]
                },
                {
                    "send_no": "20201021T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201121T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201221T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        },
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                },
                {
                    "send_no": "20201222T091709Z004002",
                    "status": "0",
                    "status_name": "未受信",
                    "customized_data_achievement_details": [
                        {
                            "server_registration_time": "2022-04-05 09:18:24",
                            "car_data_creation_time": "2022-04-05 22:13:59"
                        }]
                }
            ]
        }
    });

    // Return dummy data based on the value of [カスタマイズ定義]
    switch (definitionId) {
        case "1":
            result = initResult.at(0);
            break;
        case "2":
            result = initResult.at(1);
            break;
        case "3":
            result = initResult.at(2);
            break;
        default:
            result = initResult.at(0);
            break;
    }

    return result;
}

function createFeature() {
    var pointNum = _.random(3, 5);
    var points = [];
    _.times(pointNum, () => {
        points.push([
            _.random(139.000001, 140.299999),
            _.random(35.300001, 36.299999),
        ]);
    });

    return {
        properties: {
            type_name: 'ポリゴン',
            color: '#FFFF00',
        },
        geometry: {
            coordinates: [_.concat(points, [points[0]])],
            type: 'Polygon',
        },
        type: 'Feature',
    };
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
