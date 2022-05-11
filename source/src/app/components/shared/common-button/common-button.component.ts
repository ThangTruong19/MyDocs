import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-common-button',
    templateUrl: './common-button.component.html',
    styleUrls: ['./common-button.component.scss'],
})
export class AppCommonButtonComponent implements OnInit {

    private static readonly DEFAULT_BG_COLOR = '#ffab40';

    @Input() public tooltipLabel: string;
    @Input() public iconClass: string;
    @Input() public bgColor = AppCommonButtonComponent.DEFAULT_BG_COLOR;
    @Input() public disabled = false;

    public tooltipCss: string;

    constructor(
    ) {
    }

    ngOnInit(): void {
        this.displayToolTip(false);
    }

    public getCommonBtnStyle(): string {
        if (!this.disabled) {
            return 'background-color: ' + this.bgColor;
        } else {
            return null;
        }
    }

    public getButtonIconClass(): string {
        return this.iconClass;
    }

    public displayToolTip(isToolTipDisplay: boolean): void {
        if (this.tooltipLabel && isToolTipDisplay) {
            this.tooltipCss = 'app-cmn-btn-tooltip-display';
        } else {
            this.tooltipCss = 'app-cmn-btn-tooltip-display-none';
        }
    }

}
