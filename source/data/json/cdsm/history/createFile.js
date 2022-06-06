module.exports = function (args) {
    var data = {
        result_data: {
            file_id: '1',
        },
    };

    return success(data);
    // return fail500();
};

function success(data) {
    return {
        status: 200,
        json: {
            result_data: data.result_data,
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
