import { Component, OnInit, Input } from '@angular/core';
import { Resources } from 'app/types/common';
import * as _ from 'lodash';

@Component({
    selector: 'app-common-text',
    templateUrl: './common-text.component.html',
    styleUrls: ['./common-text.component.css'],
})
export class AppCommonTextComponent implements OnInit {

    @Input() public itemResource: Resources;
    @Input() public itemName: string;
    @Input() public itemParams: string;
    @Input() public maxlength: number;
    @Input() public type: 'text' | 'number' | 'email' | 'tel' = 'text';
    @Input() public showLabel = true;
    @Input() public disabled = false;
    @Input() public customLabel: string;

    public isVisible = false;

    constructor() { }

    ngOnInit(): void {
        if (!this._checkVisible()) {
            _.unset(this.itemParams, this.itemName);
        }
    }

    /**
     * 表示可能判定
     *
     * @return true 表示可能/false 表示不能
     */
    private _checkVisible(): boolean {
        this.isVisible = _.has(this.itemResource, this.itemName);
        return this.isVisible;
    }

}
