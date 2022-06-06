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

    mock.result_data.cars = createData(data.body);

    return success(mock);
    // return fail500();
};

function createData(queryBody) {
    let result = {};
    result = queryBody.cars;
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