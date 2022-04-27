module.exports = function(args) {
  var mock = {
    result_data: {
      model_types: [],
    },
  };
  var data;
  var divisions = {
    '0001': {
      division_id: '1',
      division_code: '0001',
      division_name: '油圧ショベル',
      models: ['PD200', 'PD300', 'SPD200', 'SPD300'],
      types: ['21', '22'],
    },
    '0002': {
      division_id: '2',
      division_code: '0002',
      division_name: 'ホイールローダ',
      models: ['PO200', 'PO300', 'SPO200', 'SPO300'],
      types: ['31', '32', '33', '34', '131', '132', '133', '231'],
    },
    '0003': {
      division_id: '3',
      division_code: '0003',
      division_name: 'クレーン',
      models: ['PC200', 'PC300', 'PC400'],
      types: ['41', '42', '43'],
    },
  };
  var rev = 'M0';
  var division = '';
  if (isNaN(args.query.division_code)) {
    division = isNaN(args.query.maker_code)
      ? divisions[1]
      : divisions[args.query.maker_code];
  } else {
    division = divisions[args.query.division_code];
  }

  for (var i = 0; i < division.models.length; i++) {
    for (var j = 0; j < division.types.length; j++) {
      data = {
        type: division.types[j],
        rev: rev,
        type_rev: isNaN(args.query.maker_code)
          ? division.types[j] + rev
          : division.types[j] + i + j + rev,
        model_id: '' + i,
        model: division.models[i],
        maker_id: isNaN(args.query.maker_code) ? '1' : args.query.maker_code,
        maker_code: isNaN(args.query.maker_code)
          ? '0001'
          : args.query.maker_code,
        maker_name: isNaN(args.query.maker_code)
          ? 'コマツ'
          : 'コマツ' + args.query.maker_code,
        division_id: division.division_id,
        division_code: division.division_code,
        division_name: division.division_name,
      };

      mock.result_data.model_types.push(data);
    }
  }

  return success(mock);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
  };
}

function fail(msg) {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
    },
  };
}
