import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModalComponent } from './app-modal.component';

describe('AppModalComponent', () => {
  let fixture: ComponentFixture<AppModalComponent>;
  let component: AppModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModalComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppModalComponent);
    component = fixture.componentInstance;
    // Do NOT call detectChanges here — each test sets inputs first
  });

  it('should not render modal when open is false', () => {
    component.open = false;
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeNull();
  });

  it('should render modal when open is true', () => {
    component.open = true;
    component.title = 'Test Modal';
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).not.toBeNull();
  });

  it('should display the title', () => {
    component.open = true;
    component.title = 'My Title';
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.modal__title');
    expect(title.textContent.trim()).toBe('My Title');
  });

  it('should emit closed when close button is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    component.open = true;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.modal__close').click();
    expect(emitted).toBe(true);
  });

  it('should emit closed when overlay is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    component.open = true;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.modal-overlay').click();
    expect(emitted).toBe(true);
  });
});
