import { Component, Input } from '@angular/core';
import { UserService } from '../../../../../services/flm/user/user.service';

@Component({
  selector: 'app-custom-user-form-modal',
  templateUrl: './custom-user-form-modal.component.html',
  styleUrls: ['./custom-user-form-modal.component.scss'],
})
export class CustomUserFormModalComponent {
  @Input() desc;
  @Input() val;
  @Input() belongingName: string;
  @Input() belongingNameColor: string;

  constructor(public userService: UserService) { }
}
