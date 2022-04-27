import { Component, OnInit, Input, TemplateRef } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[app-kba-form-table-custom]',
  templateUrl: './kba-form-table-custom.component.html',
  styleUrls: ['./kba-form-table-custom.component.css'],
})
export class KbaFormTableCustomComponent {
  @Input() kbaName: string;
  @Input() kbaResource: any;
  @Input() colspan: number;
  @Input() required: boolean;
  @Input() customHeader: TemplateRef<any>;
  @Input() content: TemplateRef<any>;
}
