import { Component } from '@angular/core';
import { AbstractFormTableTextComponent } from 'app/components/shared/abstract-component/abstract-form-table-text.component';

@Component({
    selector: '[app-form-table-textarea]',
    templateUrl: './form-table-textarea.component.html',
})
export class FormTableTextareaComponent extends AbstractFormTableTextComponent {

    protected defaultSize = 'middle';

    protected _setInitExtra(): void { }

}
