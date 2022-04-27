import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';

import { KbaFileUploadComponent } from '../../components/shared/kba-file-upload/kba-file-upload.component';
import { KbaFileUploadService } from '../../services/shared/kba-file-upload.service';
import { KbaAccordionModule } from './kba-accordion.module';

@NgModule({
  declarations: [KbaFileUploadComponent],
  imports: [CommonModule, FileUploadModule, KbaAccordionModule],
  exports: [KbaFileUploadComponent],
  providers: [KbaFileUploadService],
})
export class KbaFileUploadModule {}
