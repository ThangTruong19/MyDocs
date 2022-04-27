import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
import { NgForm } from '@angular/forms';

import { FlyoutService } from '../flyout/flyout.service';
import { CommonConfig, ConfigItems, ConfigLabels, FormItem } from '../interfaces';

@Component({
  /* tslint:disable component-selector */
  selector: 'common-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigDialogComponent {
  @Input()
  @HostBinding('attr.id')
  id: string;

  @Input() configValues: CommonConfig;
  @Input() configItems: ConfigItems;
  @Input() labels: ConfigLabels;

  @Output() submitConfig = new EventEmitter<CommonConfig>();

  constructor(private flyoutService: FlyoutService) {
    //
  }

  onSubmit(e: Event, f: NgForm) {
    e.preventDefault();

    this.submitConfig.emit({
      temperatureUnit: f.value.selectTemperatureUnit,
      dateFormat: f.value.selectDateFormat,
      carDivision: f.value.selectCarDivision,
      locale: f.value.selectLocale,
      distanceUnit: f.value.selectDistanceUnit,
      initialScreen: f.value.selectInitialScreen,
    });
    this.flyoutService.close(this.id);
  }

  cancel() {
    this.flyoutService.close(this.id);
  }

  getTrackByDistanceUnit(_, distanceUnit: FormItem) {
    return distanceUnit.value;
  }

  getTrackByTemperatureUnit(_, temperatureUnit: FormItem) {
    return temperatureUnit.value;
  }
}
