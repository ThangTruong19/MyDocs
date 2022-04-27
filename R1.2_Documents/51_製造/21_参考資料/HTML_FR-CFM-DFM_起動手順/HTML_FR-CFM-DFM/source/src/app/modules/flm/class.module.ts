import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbaCommonModule } from '../shared/kba-common.module';
import { ClassNewComponent } from '../../components/flm/class/new/class-new.component';
import { ClassIndexComponent } from '../../components//flm/class/index/class-index.component';
import { ClassEditComponent } from '../../components/flm/class/edit/class-edit.component';
import { ClassService } from '../../services/flm/class/class.service';

@NgModule({
  declarations: [ClassNewComponent, ClassIndexComponent, ClassEditComponent],
  imports: [
    RouterModule.forChild([
      { path: 'new', component: ClassNewComponent },
      { path: '', component: ClassIndexComponent },
      { path: ':class_id/edit', component: ClassEditComponent },
    ]),
    KbaCommonModule,
  ],
  providers: [ClassService],
})
export class ClassModule {}
