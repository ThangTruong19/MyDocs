import { Directive } from '@angular/core';
import { AbstractCheckboxDirective } from 'app/directives/abstract-directive/abstract-checkbox.directive';

@Directive({
  selector: '[appTableCheckbox]',
})
export class TableCheckboxDirective extends AbstractCheckboxDirective {}
