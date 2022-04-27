import { Component, Input } from '@angular/core';
import { KbaAbstractFormTableTextComponent } from '../kba-abstract-component/kba-abstract-form-table-text-component';
import { validationPattern } from '../../../constants/validation-patterns';

@Component({
  selector: '[app-kba-form-table-text]',
  templateUrl: './kba-form-table-text.component.html',
})
export class KbaFormTableTextComponent extends KbaAbstractFormTableTextComponent {
  patternRegexp: string;
  defaultSize = 'middle';
  @Input() pattern: string;
  @Input() type: 'text' | 'number' | 'email' | 'tel' = 'text';

  protected _setInitExtra() {
    this.patternRegexp = validationPattern[this.pattern];
  }
}
