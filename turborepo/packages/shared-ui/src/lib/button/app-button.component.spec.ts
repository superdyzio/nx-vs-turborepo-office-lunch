import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { AppButtonComponent } from './app-button.component';

describe('AppButtonComponent', () => {
  let fixture: ComponentFixture<AppButtonComponent>;
  let component: AppButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppButtonComponent);
    component = fixture.componentInstance;
    // Do NOT call detectChanges here — each test sets inputs first
  });

  it('should render the label', () => {
    component.label = 'Click me';
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.textContent.trim()).toBe('Click me');
  });

  it('should apply the correct variant class', () => {
    component.variant = 'danger';
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('btn--danger');
  });

  it('should emit clicked when not disabled', () => {
    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));
    component.disabled = false;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toBe(true);
  });

  it('should not emit clicked when disabled', () => {
    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));
    component.disabled = true;
    fixture.detectChanges();
    component.onClick();
    expect(emitted).toBe(false);
  });
});
