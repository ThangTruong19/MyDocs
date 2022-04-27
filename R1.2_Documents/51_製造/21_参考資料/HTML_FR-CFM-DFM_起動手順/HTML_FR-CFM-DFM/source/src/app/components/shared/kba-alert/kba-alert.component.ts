import { Component } from '@angular/core';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-kba-alert',
  templateUrl: './kba-alert.component.html',
  styleUrls: ['./kba-alert.component.scss'],
})
export class KbaAlertComponent {
  constructor(private alertService: KbaAlertService) {}

  get type() {
    return this.alertService.type;
  }

  get message() {
    return this.alertService.message;
  }

  get isAvailable() {
    return this.alertService.isAvailable;
  }

  get isVisible() {
    return this.alertService.isVisible;
  }

  close() {
    this.alertService.close();
  }

  onEndAnimation() {
    this.alertService.onEndAnimation();
  }
}
