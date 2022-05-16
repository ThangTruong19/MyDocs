import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CsGetRequestComponent } from 'app/components/customize_setting/get-request/cs-get-request.component';

@NgModule({
    declarations: [
        CsGetRequestComponent
    ],
    imports: [CommonModule, NgbModule],
    exports: [CsGetRequestComponent],
})
export class CsGetRequestModule { }