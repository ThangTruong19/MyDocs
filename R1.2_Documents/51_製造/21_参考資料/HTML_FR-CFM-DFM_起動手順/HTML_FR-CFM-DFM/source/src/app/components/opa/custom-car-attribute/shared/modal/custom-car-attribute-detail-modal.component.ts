import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-car-attribute-detail-modal',
  templateUrl: './custom-car-attribute-detail-modal.component.html',
  styleUrls: ['./custom-car-attribute-detail-modal.component.scss'],
})
export class CustomCarAttributeDetailModalComponent {
  @Input() desc;
  @Input() val;
  @Input() resource;
  @Input() useSameName;
  @Input() isDeleteModal;
  @Input() labels;

  isItemVisible(i) {
    return (this.useSameName && i === 0) || !this.useSameName;
  }
}
