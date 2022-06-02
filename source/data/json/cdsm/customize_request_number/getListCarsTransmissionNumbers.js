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
    var TOTAL = isNaN(data.header['x-count']) ? 1 : 14;
    var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;

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

    let customize_definition_id;
    let customize_definition_name;
    let assumption_data_value;
    let car_customize_data_performances = [];

    switch (customizeDefinitionId) {
        case "1":
            customize_definition_id = 1;
            customize_definition_name = "生産詳細データ";
            assumption_data_value = 1234;
            break;
        case "2":
            customize_definition_id = 2;
            customize_definition_name = "作業分類別集計データ";
            assumption_data_value = 5678;
            break;
        default:
            customize_definition_id = 1;
            customize_definition_name = "生産詳細データ";
            assumption_data_value = 1234;
            break;
    }

    for (var i = from; i <= loopEnd; i++) {
        car_customize_data_performances.push(createData(i,customizeDefinitionId));
    }

    mock.result_data = {
        "car_customized_definition": {
            "customize_definition_id": customize_definition_id,
            "customize_definition_name": customize_definition_name,
            "assumption_data_value": assumption_data_value,
            "car_customize_data_performances": car_customize_data_performances
        }
    }

    return success(mock);
    // return fail500();
};

function createData(index, customizeDefinitionId) {
    let result = {};
    let status = 0;
    let statusName = "";
    let customizedDataAchievementDetails = [];

    switch ((index + Number(customizeDefinitionId)) % 3) {
        case 0:
            status = "0";
            statusName = "要求中";
            customizedDataAchievementDetails.push({
                "server_registration_time": "2022-04-05 09:18:24",
                "car_data_creation_time": "2022-04-05 22:13:59"
            });
            break;
        case 1:
            status = "1";
            statusName = "未受信";
            customizedDataAchievementDetails.push({
                "server_registration_time": "2022-04-05 09:18:24",
                "car_data_creation_time": "2022-04-05 22:13:59"
            });
            customizedDataAchievementDetails.push({
                "server_registration_time": "2022-05-10 12:40:05",
                "car_data_creation_time": "2022-05-10 20:05:15"
            });
            break;
        case 2:
            status = "2";
            statusName = "受信済み";
            customizedDataAchievementDetails.push({
                "server_registration_time": "2022-05-10 12:40:05",
                "car_data_creation_time": "2022-05-10 20:05:15"
            });
            break;
    }

    result = {
        "send_no": index.toString() + Number(customizeDefinitionId) + "0200619T091709Z002002",
        "status": status,
        "status_name": statusName,
        "customized_data_achievement_details": customizedDataAchievementDetails
    };

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