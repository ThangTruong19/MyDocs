var fs = require('fs');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  var id = args.params.id;
  var kind = +id <= 100 ? '0' : '1';
  var photo = fs.readFileSync('./data/json/flm/contact/photo_image').toString();
  var xFields = args.header['x-fields'];

  var data = {
    contact: {
      id: id,
      kind: kind,
      support_distributor_id: '1',
      support_distributor_label: 'コマツ',
      support_distributor_label_english: 'KOMATSU',
      update_datetime: '2017-05-23T23:59:59.999Z',
    },
  };

  var representContact = {
    label: 'コマツ',
    phone_no: '03-1234-567',
  };

  var generalContact = {
    label: '連絡先１',
    email: 'contact@aaaa.co.jp',
    office_phone_no: '03-1234-567',
    cell_phone_no: '090-9876-543',
    photo_exists_kind: '1',
    photo: {
      image: photo.trim(),
      image_attribute: {
        width: 150,
        height: 150,
      },
    },
  };

  switch (kind) {
    case '1':
      data.contact.represent_contact = representContact;
      break;
    case '0':
      data.contact.general_contact = generalContact;
      break;
    default:
      break;
  }

  data = xFields ? pickAvailableResponse(data, xFields) : data;

  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data,
    },
    header: {
      'Cache-Control': 'no-cache',
    },
  };
}

function fail(msg) {
  return {
    status: 500,
    json: {
      ResultHeader: {
        Code: 0,
        Msg: msg,
      },
    },
  };
}
