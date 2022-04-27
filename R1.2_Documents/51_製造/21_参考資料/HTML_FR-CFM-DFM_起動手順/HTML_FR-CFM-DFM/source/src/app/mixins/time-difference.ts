import * as _ from 'lodash';
import { Resource } from '../types/common';

export interface TimeDifferenceData {
  time_difference: string;
  time_difference_minute: string;
}

export interface ITimeDifference {
  fifteenMinutesItem: string[];
  nextGenHoursItem: string[];
  timeDifference: TimeDifferenceData;

  omitTimeDifferenceMinuteResourceValues: (
    resourceValuesresource: Resource
  ) => Resource;
  omitTimeDifferenceHourResourceValues: (
    resourceValuesresource: Resource
  ) => Resource;
  createTimeDifference: (diff: string) => TimeDifferenceData;
  isValidMinute?: (timeDifference: TimeDifferenceData) => boolean;
  isValidHour?: (timeDifference: TimeDifferenceData) => boolean;
  joinTimeDifference: (timeDifference: TimeDifferenceData) => string;
}

export class TimeDifference implements ITimeDifference {
  fifteenMinutesItem = ['15', '45'];
  nextGenHoursItem = ['+13', '+14'];
  timeDifference = {
    time_difference: '',
    time_difference_minute: '',
  };

  /**
   * 時差（分）リソース値から15分、45分の値を削除したリソース値を返す
   * @param resourceValues 時差リソース値
   */
  omitTimeDifferenceMinuteResourceValues(resourceItem: Resource): Resource {
    const newResource = _.cloneDeep(resourceItem);
    newResource.values = _.reduce(
      newResource.values,
      (array, time_diff) => {
        if (!_.includes(this.fifteenMinutesItem, String(time_diff.value))) {
          array.push(time_diff);
        }
        return array;
      },
      []
    );
    return newResource;
  }

  /**
   * 時差（時）リソース値から+13時、+14時の値を削除したリソース値を返す
   * @param resourceValues 時差リソース値
   */
  omitTimeDifferenceHourResourceValues(resourceItem: Resource): Resource {
    const newResource = _.cloneDeep(resourceItem);
    newResource.values = _.reduce(
      newResource.values,
      (array, time_diff) => {
        if (!_.includes(this.nextGenHoursItem, String(time_diff.value))) {
          array.push(time_diff);
        }
        return array;
      },
      []
    );
    return newResource;
  }

  /**
   * 時差（文字列）を時差情報に変換する
   * @param diff 時差（文字列）
   */
  createTimeDifference(diff: string) {
    return {
      time_difference: diff.slice(0, 3),
      time_difference_minute: diff.slice(3),
    };
  }

  /**
   * 時差情報の分の値を検証する
   * @param timeDistance 時差情報
   */
  isValidMinute(timeDifference: TimeDifferenceData): boolean {
    return !_.includes(
      this.fifteenMinutesItem,
      timeDifference.time_difference_minute
    );
  }

  /**
   * 時差情報の時の値を検証する
   * @param timeDistance 時差情報
   */
  isValidHour(timeDifference: TimeDifferenceData): boolean {
    return !_.includes(this.nextGenHoursItem, timeDifference.time_difference);
  }

  /**
   * 時差情報を時差（文字列）に変換する
   * @param timeDistance 時差情報
   */
  joinTimeDifference(timeDifference: TimeDifferenceData): string {
    return (
      timeDifference.time_difference + timeDifference.time_difference_minute
    );
  }
}
