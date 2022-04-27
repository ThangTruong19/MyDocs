import { Component } from '@angular/core';
import { KbaAbstractFormTableTextComponent } from '../kba-abstract-component/kba-abstract-form-table-text-component';

@Component({
  selector: '[app-kba-form-table-textarea]',
  templateUrl: './kba-form-table-textarea.component.html',
})
export class KbaFormTableTextareaComponent extends KbaAbstractFormTableTextComponent {
  defaultSize = 'middle';

  protected _setInitExtra() {}
}
