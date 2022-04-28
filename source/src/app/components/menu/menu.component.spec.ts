import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuComponent } from 'app/components/menu/menu.component';

describe('MenuComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            declarations: [
                MenuComponent
            ],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture: ComponentFixture<MenuComponent> = TestBed.createComponent(MenuComponent);
        const app: MenuComponent = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'cdsm'`, () => {
        const fixture: ComponentFixture<MenuComponent> = TestBed.createComponent(MenuComponent);
        const app: MenuComponent = fixture.componentInstance;
    });

    it('should render title', () => {
        const fixture: ComponentFixture<MenuComponent> = TestBed.createComponent(MenuComponent);
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.content span')?.textContent).toContain('cdms app is running!');
    });
});
