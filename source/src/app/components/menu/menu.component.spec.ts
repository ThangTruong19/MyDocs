import { TestBed } from '@angular/core/testing';
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
        const fixture = TestBed.createComponent(MenuComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'cdsm'`, () => {
        const fixture = TestBed.createComponent(MenuComponent);
        const app = fixture.componentInstance;
    });

    it('should render title', () => {
        const fixture = TestBed.createComponent(MenuComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.content span')?.textContent).toContain('cdms app is running!');
    });
});
