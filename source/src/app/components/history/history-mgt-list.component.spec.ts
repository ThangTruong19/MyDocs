import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryMgtListComponent } from 'app/components/history/history-mgt-list.component';

describe('HistoryMgtListComponent', () => {
    let component: HistoryMgtListComponent;
    let fixture: ComponentFixture<HistoryMgtListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryMgtListComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoryMgtListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
