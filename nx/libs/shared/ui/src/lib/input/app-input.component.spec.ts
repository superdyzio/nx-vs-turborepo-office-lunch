import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { AppInputComponent } from './app-input.component';

describe('AppInputComponent', () => {
  let fixture: ComponentFixture<AppInputComponent>;
  let component: AppInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppInputComponent);
    component = fixture.componentInstance;
    // Do NOT call detectChanges here — each test sets inputs first
  });

  it('should render a label when provided', () => {
    component.label = 'Username';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.input-label');
    expect(label.textContent.trim()).toBe('Username');
  });

  it('should not render a label when not provided', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.input-label');
    expect(label).toBeNull();
  });

  it('should set input type', () => {
    component.type = 'password';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
  });

  it('should call onChange when value changes', () => {
    fixture.detectChanges();
    let changed = '';
    component.registerOnChange((v: string) => (changed = v));
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(changed).toBe('hello');
  });

  it('should write value via writeValue', () => {
    fixture.detectChanges();
    component.writeValue('preset');
    expect(component.value).toBe('preset');
  });
});
