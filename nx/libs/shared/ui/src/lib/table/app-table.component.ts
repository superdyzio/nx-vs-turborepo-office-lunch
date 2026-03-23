import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableRowAction {
  action: string;
  row: Record<string, unknown>;
}

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './app-table.component.html',
  styleUrl: './app-table.component.scss',
})
export class AppTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];

  @Output() rowAction = new EventEmitter<TableRowAction>();

  onAction(action: string, row: Record<string, unknown>): void {
    this.rowAction.emit({ action, row });
  }

  getCellValue(row: Record<string, unknown>, key: string): unknown {
    return row[key];
  }
}
