import { Component } from '@angular/core';
import { AlertService } from 'app/services/shared/alert.service';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {

    constructor(
        private alertService: AlertService
    ) { }

    public get type(): string {
        return this.alertService.type;
    }

    public get alertMessagesCss(): string {
        return this.alertService.typeCss;
    }

    public get message(): string {
        return this.alertService.message;
    }

    public get isAvailable(): boolean {
        return this.alertService.isAvailable;
    }

    public get isVisible(): boolean {
        return this.alertService.isVisible;
    }

    public close(): void {
        this.alertService.close();
    }

    public onEndAnimation(): void {
        this.alertService.onEndAnimation();
    }

}
