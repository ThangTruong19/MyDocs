import { Component, Input } from '@angular/core';
import { AbstractFormTableTextComponent } from '../abstract-component/abstract-form-table-text.component';
import { validationPattern } from 'app/constants/validation-patterns';

@Component({
    selector: '[app-form-table-text]',
    templateUrl: './form-table-text.component.html',
})
export class FormTableTextComponent extends AbstractFormTableTextComponent {

    @Input() public pattern: string;
    @Input() public type: 'text' | 'number' | 'email' | 'tel' = 'text';

    protected defaultSize = 'middle';

    protected _setInitExtra(): void {
        this.patternRegexp = Object.keys(validationPattern)
            .find((key: string) => key === this.pattern);
    }

}
