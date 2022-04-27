import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-user-form-modal',
  templateUrl: './custom-user-form-modal.component.html',
  styleUrls: ['./custom-user-form-modal.component.scss'],
})
export class CustomUserFormModalComponent {
  @Input() desc;
  @Input() val;
}
