import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload';

import { FileUploadComponent } from 'app/components/shared/file-upload/file-upload.component';
import { FileUploadService } from 'app/services/shared/file-upload.service';
import { AccordionModule } from 'app/modules/shared/accordion.module';

@NgModule({
    declarations: [FileUploadComponent],
    imports: [CommonModule, FileUploadModule, AccordionModule],
    exports: [FileUploadComponent],
    providers: [FileUploadService],
})
export class AppFileUploadModule { }
