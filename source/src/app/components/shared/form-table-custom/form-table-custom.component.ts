import { Component, Input, TemplateRef } from '@angular/core';
import { Resources } from 'app/types/common';

@Component({
    selector: '[app-form-table-custom]',
    templateUrl: './form-table-custom.component.html'
})
export class FormTableCustomComponent {
    @Input() public itemName: string;
    @Input() public itemResource: Resources;
    @Input() public colspan: number;
    @Input() public required: boolean;
    @Input() public customHeader: TemplateRef<any>;
    @Input() public content: TemplateRef<any>;
}
