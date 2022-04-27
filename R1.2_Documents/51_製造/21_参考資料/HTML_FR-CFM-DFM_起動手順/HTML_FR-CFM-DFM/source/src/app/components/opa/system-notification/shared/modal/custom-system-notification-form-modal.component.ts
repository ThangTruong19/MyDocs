import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-system-notification-form-modal',
  templateUrl: './custom-system-notification-form-modal.component.html',
  styleUrls: ['./custom-system-notification-form-modal.component.scss'],
})
export class CustomSystemNotificationFormModalComponent {
  @Input() desc;
  @Input() val;
  @Input() rowspan: number;
  @Input() isBlockKind: boolean;
}
