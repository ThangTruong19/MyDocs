import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppIndexComponent } from 'app/components/app-index/app-index.component';

describe('AppIndexComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            declarations: [
                AppIndexComponent
            ],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture: ComponentFixture<AppIndexComponent> = TestBed.createComponent(AppIndexComponent);
        const app: AppIndexComponent = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'cdsm'`, () => {
        const fixture: ComponentFixture<AppIndexComponent> = TestBed.createComponent(AppIndexComponent);
        const app: AppIndexComponent = fixture.componentInstance;
    });

    it('should render title', () => {
        const fixture: ComponentFixture<AppIndexComponent> = TestBed.createComponent(AppIndexComponent);
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.content span')?.textContent).toContain('cdms app is running!');
    });
});
