import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCardComponent } from './app-card.component';

describe('AppCardComponent', () => {
  let fixture: ComponentFixture<AppCardComponent>;
  let component: AppCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
    // Do NOT call detectChanges here — each test sets inputs first
  });

  it('should render title when provided', () => {
    component.title = 'My Card';
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.card__title');
    expect(title.textContent.trim()).toBe('My Card');
  });

  it('should not render header when title is empty', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.card__header');
    expect(header).toBeNull();
  });

  it('should render card body', () => {
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.card__body');
    expect(body).not.toBeNull();
  });
});
