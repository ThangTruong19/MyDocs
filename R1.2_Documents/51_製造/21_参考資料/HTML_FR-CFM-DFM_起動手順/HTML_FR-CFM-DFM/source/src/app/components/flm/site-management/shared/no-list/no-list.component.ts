import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-list',
  templateUrl: './no-list.component.html',
  styleUrls: ['./no-list.component.scss'],
})
export class NoListComponent {
  @Input() labels;

  constructor(private router: Router) {}

  showDetailAllCars(): void {
    this.router.navigateByUrl('/site-management/detail/stat');
  }
}
