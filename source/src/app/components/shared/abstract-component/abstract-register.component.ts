import { OnInit, ViewChild, TemplateRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';

@Component({ template: '' })
export abstract class AbstractRegisterComponent
    extends AbstractBaseComponent
    implements OnInit {

    @ViewChild('submitModalContent', { static: false })
    public submitModalContent: TemplateRef<null>;

    @ViewChild('resetModalContent', { static: false })
    public resetModalContent: TemplateRef<null>;

    public isUpdate = false;
    protected abstract params: any;

    constructor(
        protected override navigationService: NavigationService,
        protected override title: Title,
        protected header: CommonHeaderService = null
    ) {
        super(navigationService, title);
    }

    ngOnInit(): void {
        this._fetchDataForInitialize().then(async () => {
            await this.header.setHeader(this.labels, this.resource, this.functions);
            this.onLoad();
        });
    }

    /**
     * 初期表示のためのデータを取得します。
     */
    protected abstract _fetchDataForInitialize(): Promise<any>;

}
