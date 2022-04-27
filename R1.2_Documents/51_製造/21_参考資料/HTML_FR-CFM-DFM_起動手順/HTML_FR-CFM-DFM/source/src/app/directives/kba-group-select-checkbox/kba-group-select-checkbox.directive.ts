import { Directive } from '@angular/core';
import { KbaAbstractCheckboxDirective } from '../shared/kba-abstract-directive/kba-abstract-checkbox.directive';

@Directive({
  selector: '[appKbaGroupSelectCheckbox]',
})
export class KbaGroupSelectCheckboxDirective extends KbaAbstractCheckboxDirective {}
