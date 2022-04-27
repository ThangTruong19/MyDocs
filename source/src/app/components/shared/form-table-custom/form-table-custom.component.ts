import { Component, OnInit, Input, TemplateRef } from '@angular/core';

@Component({
    selector: '[app-form-table-custom]',
    templateUrl: './form-table-custom.component.html'
})
export class FormTableCustomComponent {
    @Input() public itemName: string;
    @Input() public itemResource: any;
    @Input() public colspan: number;
    @Input() public required: boolean;
    @Input() public customHeader: TemplateRef<any>;
    @Input() public content: TemplateRef<any>;
}
