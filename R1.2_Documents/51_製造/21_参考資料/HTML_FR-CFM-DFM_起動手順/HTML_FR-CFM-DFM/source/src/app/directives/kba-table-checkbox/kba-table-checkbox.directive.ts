import { Directive } from '@angular/core';
import { KbaAbstractCheckboxDirective } from '../shared/kba-abstract-directive/kba-abstract-checkbox.directive';

@Directive({
  selector: '[appKbaTableCheckbox]',
})
export class KbaTableCheckboxDirective extends KbaAbstractCheckboxDirective {}
