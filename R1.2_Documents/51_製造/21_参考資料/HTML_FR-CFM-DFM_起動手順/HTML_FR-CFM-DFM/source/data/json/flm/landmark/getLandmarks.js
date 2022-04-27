var _ = require('lodash');
var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }
  const xFields = args.header['x-fields'];
  var from = args.header['x-from'] ? parseInt(args.header['x-from']) : 1;
  var count = args.header['x-count'] ? parseInt(args.header['x-count']) : 100;
  var sort = args.header['x-sort'] || '';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    landmarks: [],
  };

  if (args.query.landmark_id) {
    from = 1;
    count = 1;
    const id = args.query.landmark_id;

    data.landmarks.push(createData(args, id));
    return success({
      result_header: {
        'X-From': from,
        'X-Count': count,
        'X-Sort': sort,
        'X-TotalCount': TOTAL,
        'Cache-Control': 'no-cache',
      },
      result_data: xFields ? pickAvailableResponse(data, xFields) : data,
    });
  } else {
    // 一覧画面の場合
    for (var i = from; i <= loopEnd; i++) {
      data.landmarks.push(createData(args, i));
    }

    return success({
      result_header: {
        'X-From': from,
        'X-Count': count,
        'X-Sort': sort,
        'X-TotalCount': TOTAL,
        'Cache-Control': 'no-cache',
      },
      result_data: xFields ? pickAvailableResponse(data, xFields) : data,
    });
  }
};

function createData(args, i) {
  var kind = Number(i) % 2;
  var groupId = args.query.group_id ? args.query.group_id : '1';
  var data = {
    id: String(i),
    label: `コマツ ${i}`,
    icon: {
      id: '1',
      image: [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjODBjMjFlYy1kNTI1LTQ0YTMtODE0ZC05NDEwNjI2NDRjZmEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjM5NEVDN0U2MENCMTFFNTk0NjRBMjM5QkU3MjNGMjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjM5NEVDN0Q2MENCMTFFNTk0NjRBMjM5QkU3MjNGMjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDplMDM5ZTNhZS1hNTc4LTQ5NzktYWZjZC00NzhlOTVmYzkwNjIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6YzgwYzIxZWMtZDUyNS00NGEzLTgxNGQtOTQxMDYyNjQ0Y2Zh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',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAL9ElEQVR4Xu3dP0wb2RbH8ctr6aEOghTRuidQQgMvEqleQfOkSEAXnGILSymJKLaISQdIkV5DpFeFKAsNlAF6RymC5R56atbHvh4bsGFsz4zn3PP9SN6d8Y7Y8cyd39x/Ho/d1jkErVKpuFKp5Nfi2d7edoVCwa8hVP/y/wZgEAEAGEYAAIYRAIBhBABgGAEAGEYAAIYRAIBhBABgGAEAGEYAQKmq25kfc2Nj9df8Tn0NgyAAgJQdb/igqr/md7pHVXVnPtrmqW2TRABAqWm3+ePWyXfZbn9s1tfySS7s5T2/0lWzJjNTPPPrbWfFmdRrNwQAkJbjja4Xdqfqzn9dtMn6UTPQ6q+jdf/eWdH9deyXU0AAAGmo7rj5xq1/zpWPyvV/dlN1f/8/uvrd0e6SX3Zuafeo/k7T3tf0EoAAgFKPdQIeu4177emxsXl3t0ndbZuN+rt3tdvvzf92v63evZ1e/9szRSeX9vrRD7c503z3oUv3q3X9z71wdzebcS9aqbH39cF+JYUAQFjq1e6xsWX3sNl95oqtunTPbfbccv2i3uh6tTX/2/0qvbTT729/vOH/dr1K33FTf9wfz+/1Y0y753/4xRQRAAhI/c4b9bjVq9S+Pd14RY3qjm3myu4y2qajyr38sCYg1o+6/T3nfv5u1wKiTj/5209d/dXf7qdfHBUCAOE4/hrd1dePdt2dy29p193KBdm5zfvO0YMltxtd1HvuYbN73b3u/INLr6PAOPt12VyIOv3q4RNnZGL6ucvgJv8oAgDBqP5u3U/n3Iue7e6WLtvMvOjRWRdP+//fbC5EfQW+P0A0hva6NTN+/r7Xj1F10Z9LEQGAYExHjeYz17op99Zlm8tf0YWajY6OvrNf7s7uVP927QGC13drMwkiABCOjmr5g3a8dPzJbbdzm63O0YOq29lq9x/cqe7HNL35o91H0Pm6bA8DzpUvG+81uwem3b//E3X1u+WOasHxX+1aw/ogOxMTAYCALLk/yx0XVGc1POoc7GjrnxXdTLTNTDQh50H/QYqmN//n2ru8HO1vtLtzZfdnijtDACAozbtwu0e/bc6VW1eSdAh23aY5chB76C4RzSnNl1EKtDVqCylPc+aHQQzgh0HQCzUAwDACADCMAAAMIwAAwwgAwDACADCMAAAMIwAAwwgAwDACADCMAAAMIwAAwwgAwDACADCMrwMbUKvV3P7+vl+LZ21tzU1NTfk1hIoAAAyjCQAYRgAAhhEAgGEEAGAYAQAYRgAAhjEMqNDJyYk7PT31a/mwsLDgFhcX/Rq0IAAUOjg4aLzyZHV1tfGCLjQBAMMIAMAwAgAwjAAADCMAAMMIAMAwAgAwjAAADCMAFJqYmPBL+cHTg3QiABSanJz0S/kxPj7ul6AJAQAYRgAAhhEAgGEEAGAYAQAYRgAodHNz45eA4RAACskv/eRNpVLxS9CEAAAMIwAAw3gmIGAYNQDAMAIAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDmAiUE6VSyS/ZsL297ZcwSgRATrx69cov2fD9+3e/hFGiCQAYRgAAhhEAgGEEAGAYAQAYRgAAhhEAgGEEAGAYAQAYRgAAhhEAgGEEAGAYAQAYRgAAhhEAgGEEAGAYAQAYRgAAhhEAgGE8EzAnKpWKX7KhUCj4JYwSAQAYRhMAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDmAegzNXVlTs9PfVr+bKwsOAmJyf9GjQgAJQ5PDx0+/v7fi1f1tbW3MrKil+DBjQBlLm5ufFL+ZPnfUN3BABgGAGgTK1W80v5k+d9Q3cEgDI0AZAkAkAZAgBJIgCUoQmAJBEAgGEEgCIa7rDUAnQhABTR0MamH0AXAkARmQacdxr2EW0EgCLX19d+Kb807CPaCABFCAAkjQBQhCYAkkYAKEINAEkjABShBoCkEQBKaBpfZy6AHgSAEprG15kLoAcBoISm3w609juHmhEASlADQBoIACXoA0AaCAAlCACkgQBQgiYA0kAAKKCxU42OQB34XQAFLi4uGr8HoIn8PsDs7KxfQ14RAIBhNAEAwwgAwDACADCMAAAMIwAAwwgAwDACADCMAAAMYyJQAmTaa6lU8mvIwurqauOF4VADAAwjAADDCADAMAIAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDCADAMAIAMIwAAAwjAADDCADAMH4bMAFXV1fu9PTUryELhUKh8cJwCADAMJoAgGEEAGAYAQAYRgAAhhEAgGEEAGAYw4AZOjk5ceVy2a+hm2Kx6BYXF/0a0kYNIEMXFxd+Cb1wjLJFAGTk5uaGwh2DHCM5VsgGAZARqf4jHo5VdgiAjPBdgfg4VtkhADJQq9UaL8TD8coOAZCBb9+++SXExTHLBgGQMunQOj8/92uIS44ZnYHpIwBSJh1aFOT+yTGjMzB9BEDKqMoOjmOXPgIgRTKmLU8LwmDk2DF3Il0EQIoODw/9EgbFMUwXAZASuXtVKhW/hkHJMaQWlR4CICVfvnzxSxgWxzI9BEAK5I5FD3Zy5FhSC0gHAZACeq+Tx/TgdBAACWP8Oh3SGch8iuQRAAmjoKZDjikjAskjABJEIU0X4Zo8AiBBFNB0EbDJIwASQuHMBiGbLAIgIRTMbBC0ySIAEkChzBZhmxwCIAEUyGwRuMkhAIZEYRwNQjcZBMCQKIijQfAmgwAYAoVwtAjf4REAQ6AAjhYBPDwCYEAUvnwghIdDAAxof3+fgpcDcg7kXGAwBMAA+L5/vvC8gMERAAPgCTX5wzkZDAHQJ3lGHXf//JFzwjMY+0cA9Ong4MAvIW84N/0jAPogz6jnLpNfcm74HYH+EAB9oLc5/zhH/SEAYpLxZnqa80/OEfMz4iMAYpCxZtqXesi5Yo5GPARADBQoXQjs+AiAJ1Cl1IkmWzwEwBPK5bJfgjacu6cRAI9g2E83hgWfRgD0wJdMwsCXth5HAPRAGzIM9OE8jgDogkITFsK8NwKgC+k8otoYDjmXdAh2RwDcQ8dfmOgQ7I4A6EDHX9joEHyIAOhAWzFs9O08RAB4tVqN6aMGyDmWc40mAsCj6m8H57pt7LbOL5sl1cLQC8XU1JQrFApuYmKisdyN3Bmvr68bHWah3yXX1tbcysqKX7PLfABIu/Dt27dBdg7Nzs42Xi9fvnTj4+P+3XjkeJyfnzd6zkPsPZfj8enTJzc5Oenfscl8AJRKpaCG/aRgy51NXv1e9L1IGEgtSV4hBaWE4/v37/2aTaYDQO5sW1tbfk23NC78+0IMAgkACQKrzAaAFOA3b94EUZDlol9dXU3twr9Pjpn0pksQaCfH7PPnz5kdu7wxGwBy59fetpX2a7FYbHTujYI0nWSKrfa5E5abAiaHAUPo2FpcXGx0Yo3q4hfy/5Z9kH3RLITyMChzNYAQqv55HMKS5oDmoVSrTQFzNYCPHz+qvfilcEqVP28Xv5B9kn3TegFJmZCyYY2pAJDfj9Na1ZMLa3t7O9fVbdk32UetISBlw9rvPpoJAOmo0lpFbV38vWbw5Ynso+YQkDJi6QthZgJA80M+3r17p+Lib5F9lX3WSMqIpYeHmAgAGbPWOttP2tUaJ6rIPsu+ayRlxco3Q4MPAM0nU9rUmofYNO+/5ptGP4IOAM3VOZnkI8N92sln0PqFG83NxriCDgAZ1tHaoaN5SK2TfAatTQEpO6EPDQYbADIxReuQn4ypj3KGX9Lks+Rx7kIcUoZC+M5DL0EGgDzMQvOQn3yxJzRZflkpaVKWQn1ASnABIG02+Y6/VnKnDKHqf598Jq21ACFlKsT+gOACQPOJ0n6RPEVzuGm/sfQSVABIr63mqpoMmYV492+Rz6Z5WFPKVmiThIIJAJnDrX0e98LCgl8Kl/bPGEI56xREALQeTKGZjJVrmu47KPmM2h/EKWUtlElC6gNAqmUhPNfP0nPpQvisUuZCGBlQHQByAkLpnX327JlfCl8In7XVKag9BNQGgJyADx8+BHHxC+3V4n6E8lml7OmeLuzcP31tS4m3nCAtAAAAAElFTkSuQmCC',
      ][Number(i) % 2],
      name: '会社',
    },
    point: {
      type: 'Point',
      coordinates: [139 + 0.1 * i, 35 + 0.1 * i],
    },
    group: {
      id: groupId,
      label: `グループ${groupId}`,
      label_english: `group${groupId}`,
    },
    free_memo: '東京都にあります。\nあります。',
    publish_kind: String(kind),
    publish_name: kind ? '共有する' : '共有しない',
    update_datetime: '2017-08-01T00:00:00.999Z',
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

function fail(msgs) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'COM0002E',
          message: 'リクエスト情報が不正です。',
          keys: ['car_id'],
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
