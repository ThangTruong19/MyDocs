import { Directive } from '@angular/core';
import { AbstractCheckboxDirective } from '../abstract-directive/abstract-checkbox.directive';

@Directive({
  selector: '[appAuthoritySelectCheckbox]',
})
export class AuthoritySelectCheckboxDirective extends AbstractCheckboxDirective {}
