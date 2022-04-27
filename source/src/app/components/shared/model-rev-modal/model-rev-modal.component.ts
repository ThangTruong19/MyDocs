import {
    Component,
    Input,
    OnInit,
    ChangeDetectorRef,
} from '@angular/core';
import { ModalService } from 'app/services/shared/modal.service';
import { ApiService } from 'app/services/api/api.service';
import {
    groupBy,
    pick,
    map,
    remove,
    isEqual,
    isEmpty,
    cloneDeep,
    flattenDeep,
    sortBy,
} from 'lodash';
import { ModelRevService } from 'app/services/shared/model-rev.service';
import { Labels } from 'app/types/common';

interface DivisionList {
    [divisionCode: string]: {
        model: string;
        divisions: {
            type: string;
            rev: string;
            type_rev: string;
            model_id: string;
            model: string;
            maker_id: string;
            maker_code: string;
            maker_name: string;
            division_id: string;
            division_code: string;
            division_name: string;
        }[];
    }[];
}

interface ModelRevParams {
    modelSelectType: string;
    division_code?: string;
    groupId?: string;
    support_distributor_id?: string;
}

@Component({
    selector: 'app-model-rev-modal',
    templateUrl: './model-rev-modal.component.html',
    styleUrls: ['./model-rev-modal.component.scss'],
})
export class ModelRevModalComponent implements OnInit {

    @Input() public labels: Labels;
    @Input() public resource: any;
    @Input() public params: ModelRevParams;
    // モーダル再表示時に読み込みを行わないよう親コンポーネントで管理を行う
    @Input() public divisionList: DivisionList;
    @Input() public selectedDivisions: DivisionList;
    @Input() public showRefModal: Function;

    public modelSelectType: {
        all: string;
        select: string;
    } = {
        all: '0',
        select: '1',
    };

    private compareKeys: string[] = ['division_code', 'model', 'type_rev'];

    constructor(
        private modalService: ModalService,
        private api: ApiService,
        private modelRevService: ModelRevService,
        private ref: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (isEmpty(this.divisionList)) {
            this._fetchDivisionList(this.resource.division_code.values[0].value);
        }
    }

    /**
     * 車両種類選択時の動作
     * @param id 車種 ID
     */
    public onDivisionChange(id: string): void {
        this._fetchDivisionList(id);
    }

    /**
     * 参照モーダルを開く
     * @param division 選択された機種
     */
    public executeShowRefModal(division: any): void {
        const params: { model: string; maker_code: string; group_id: string; support_distributor_id: string; } = {
            model: division.model,
            maker_code: division.divisions[0].maker_code,
            group_id: undefined,
            support_distributor_id: undefined,
        };
        if (this.params.groupId) {
            params.group_id = this.params.groupId;
        }
        if (this.params.support_distributor_id) {
            params.support_distributor_id = this.params.support_distributor_id;
        }
        this.showRefModal(params);
    }

    /**
     * 機種選択方式変更時の処理
     */
    public onModelSelectTypeChange(): void {
        this.modalService.enableOk = this.modelRevService.isValid(
            this.params,
            this.selectedDivisions
        );
    }

    /**
     * 型式の選択ボタンに付与するクラスを返す
     * @param d 機種・型式
     */
    public getClassForDivision(d: any): string {
        return this.modelRevService.isDivisionSelected(
            this.params,
            this.selectedDivisions,
            d
        )
            ? 'btn-active'
            : 'btn-secondary';
    }

    /**
     * 型式の選択状態を切り替える
     * @param d 機種・型式
     */
    public toggleDivisionSelection(d: any): void {
        if (this.selectedDivisions[this.params.division_code] == null) {
            this.selectedDivisions[this.params.division_code] = [];
        }

        if (
            !this.selectedDivisions[this.params.division_code].find(
                el => el.model === d.model
            )
        ) {
            this.selectedDivisions[this.params.division_code].push({
                model: d.model,
                divisions: [],
            });
        }

        const target = this.selectedDivisions[this.params.division_code].find(
            el => el.model === d.model
        );
        const removed = remove(target.divisions, (el: any) =>
            this.compareKeys.every((key: string) => el[key] === d[key])
        );

        if (isEmpty(removed)) {
            target.divisions.push(d);
        }
        this.modalService.enableOk = this.modelRevService.isValid(
            this.params,
            this.selectedDivisions
        );
    }

    /**
     * 全選択・全解除チェック切り替え時の処理
     * @param event イベント
     * @param divisionCode 現在選択されている車種
     */
    public toggleSelectAll(event: any, divisionCode: string): void {
        if (event.target.checked) {
            this.selectedDivisions[divisionCode] = cloneDeep(
                this.divisionList[divisionCode]
            );
        } else {
            this.selectedDivisions[divisionCode] = [];
        }
        this.modalService.enableOk = this.modelRevService.isValid(
            this.params,
            this.selectedDivisions
        );
    }

    /**
     * 全選択状態であるかを判定
     * @param divisionCode 現在選択されている車種
     */
    public isSelectedAll(divisionCode: string): boolean {
        if (
            !this.selectedDivisions[divisionCode] ||
            !this.divisionList[divisionCode]
        ) {
            return false;
        }

        return isEqual(
            sortBy(
                flattenDeep(
                    this.selectedDivisions[divisionCode].map(d =>
                        d.divisions.map(_d => pick(_d, this.compareKeys))
                    )
                ),
                this.compareKeys
            ),
            sortBy(
                flattenDeep(
                    this.divisionList[divisionCode].map(d =>
                        d.divisions.map(_d => pick(_d, this.compareKeys))
                    )
                ),
                this.compareKeys
            )
        );
    }

    /**
     * 車両種別リスト取得 API を実行
     * @param divisionCode 車両種類 ID
     */
    private _fetchDivisionList(divisionCode: string): void {
        if (this.divisionList[divisionCode]) {
            return;
        }

        const params: { division_code: string; } = {
            division_code: divisionCode
        };

        this.api.fetchDivisionList(params).then((res: any) => {
            this.divisionList[divisionCode] = map(
                groupBy(res.result_data.model_types, 'model'),
                (divisions, model) => {
                    return {
                        model,
                        divisions
                    };
                }
            );
            this.ref.detectChanges();
        });
    }
}
