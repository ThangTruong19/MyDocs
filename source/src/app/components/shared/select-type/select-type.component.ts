import {
    Component,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
} from '@angular/core';
import { each, keys, first, isEmpty } from 'lodash';
import { Labels, ListSelection } from 'app/types/common';
import { FilterReservedWord } from 'app/constants/condition';
import * as _ from 'lodash';
import { SelectItem } from 'app/types/select-item';

@Component({
    selector: 'app-select-type',
    templateUrl: './select-type.component.html',
    styleUrls: ['./select-type.component.scss'],
})
export class SelectTypeComponent implements OnChanges {

    @Input() public name: string;
    @Input() public targets: any;
    @Input() public labels: Labels;

    @Output() public changed: EventEmitter<any> = new EventEmitter();

    public selectedOption: 'all' | 'non' | 'selections';
    public targetInfo: ListSelection = {};
    public selectTypes: string[] = [];
    public listSelections: SelectItem[];
    public selectedListItems: SelectItem[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.targets && changes.targets.currentValue) {
            this.selectedListItems = [];
            this.targetInfo = this._parseTargetResource(changes.targets.currentValue);
            this.selectTypes = keys(this.targetInfo);
            if (isEmpty(this.selectedOption)) {
                this.selectedOption = <'all' | 'non' | 'selections'>first(this.selectTypes);
            }
            this.listSelections = this._buildListSelections(
                this.targetInfo.selections
            );
        }
    }

    /**
     * 選択種別の変更時コールバック
     * @param value
     */
    public onChangeSelectType(value: any): void {
        this.changed.emit();
    }

    /**
     * セレクトボックスの選択要素変更時コールバック
     */
    public onChangeItems(): void {
        this.changed.emit();
    }

    /**
     * 選択済みタグの x ボタン押下時の処理
     * @param id 選択済みタグに紐づけられた ID
     */
    public onClickRemoveTag(id: string): void {
        this.selectedListItems = this.selectedListItems.filter(
            item => item.id !== id
        );
        this.changed.emit();
    }

    /**
     * 選択種別およびセレクトボックスの選択要素の変更処理
     * @param items 変更内容
     */
    public setSelectedParam(items: string[]): void {
        if (_.isEmpty(items)) {
            return;
        }

        const item: string = _.first(items);
        if (item === FilterReservedWord.selectAll) {
            this.selectedOption = 'all';
        } else if (item === FilterReservedWord.isNull) {
            this.selectedOption = 'non';
        } else if (item === FilterReservedWord.isNotNull) {
            this.selectedOption = 'non';
        } else {
            this.selectedOption = 'selections';
            const sItems = _.map(items, i => {
                return _.find(this.listSelections, l => l.id === i);
            });
            this.selectedListItems = _.compact(sItems);
        }
    }

    /**
     * 選択種別およびセレクトボックスの選択要素の初期化処理
     */
    public initSelectedParam(): void {
        this.selectedListItems = [];
        this.selectedOption = <'all' | 'non' | 'selections'>first(this.selectTypes);
    }

    /**
     * 選択内容を params 用に整形して返します。
     */
    public getSelectedParam(): string[] {
        if (this.selectedOption === 'selections') {
            return this.selectedListItems.map(item => `${item.id}`);
        } else {
            if (this.targetInfo[this.selectedOption]) {
                return [this.targetInfo[this.selectedOption].value];
            }
            return null;
        }
    }

    public refreshSelectedParam(items: string[]): void {
        if (this.targetInfo.all && items.includes(this.targetInfo.all.value)) {
            this.selectedOption = 'all';
        } else if (
            this.targetInfo.non &&
            items.includes(this.targetInfo.non.value)
        ) {
            this.selectedOption = 'non';
        } else {
            this.selectedOption = 'selections';
            let resourceItem: any;

            this.selectedListItems = items.map(item => ({
                id: item,
                name: (resourceItem = this.targets.values.find(
                    (target: any) => target.value === item
                ))
                    ? resourceItem.name
                    : '',
            }));
        }
    }

    /**
     * 対象のリソース情報からリストの選択肢を作成します。
     * @param targetSelections 対象のリソース情報
     */
    private _buildListSelections(targetSelections: any): SelectItem[] {
        return targetSelections
            ? targetSelections.map((el: any) => ({
                id: el.value,
                name: el.name,
            }))
            : null;
    }

    /**
     * 指定したリソース情報をラジオボタンとセレクトボックスの構成となる
     * 画面表示用情報に変換する
     * @param resTargetIds リソース情報
     * @return 画面表示用情報
     */
    private _parseTargetResource(resTargetIds: any): ListSelection {
        const targetInfo: ListSelection = {};

        each(resTargetIds.values, (v, index) => {
            if (v.value === FilterReservedWord.selectAll) {
                targetInfo.all = { label: v.name, value: v.value };
            } else if (v.value === FilterReservedWord.isNull) {
                targetInfo.non = { label: v.name, value: v.value };
            } else {
                if (isEmpty(targetInfo.selections)) {
                    targetInfo.selections = [];
                }
                targetInfo.selections.push(v);
            }
        });
        return targetInfo;
    }

}
