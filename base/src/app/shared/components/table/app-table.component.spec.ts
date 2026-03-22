import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTableComponent } from './app-table.component';

describe('AppTableComponent', () => {
  let fixture: ComponentFixture<AppTableComponent>;
  let component: AppTableComponent;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];
  const rows = [
    { name: 'Alice', status: 'active' },
    { name: 'Bob', status: 'disabled' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppTableComponent);
    component = fixture.componentInstance;
    // Do NOT call detectChanges here — each test sets inputs first
  });

  it('should render column headers', () => {
    component.columns = columns;
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('.table__th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent.trim()).toBe('Name');
    expect(headers[1].textContent.trim()).toBe('Status');
  });

  it('should render rows', () => {
    component.columns = columns;
    component.rows = rows;
    fixture.detectChanges();
    const tableRows = fixture.nativeElement.querySelectorAll('.table__row');
    expect(tableRows.length).toBe(2);
  });

  it('should show empty message when no rows', () => {
    component.columns = columns;
    component.rows = [];
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('.table__empty');
    expect(empty).not.toBeNull();
  });

  it('should emit rowAction when onAction is called', () => {
    fixture.detectChanges();
    let emitted: unknown = null;
    component.rowAction.subscribe((e) => (emitted = e));
    component.onAction('edit', rows[0]);
    expect(emitted).toEqual({ action: 'edit', row: rows[0] });
  });
});
