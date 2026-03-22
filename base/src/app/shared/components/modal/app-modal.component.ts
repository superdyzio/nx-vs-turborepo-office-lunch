import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './app-modal.component.html',
  styleUrl: './app-modal.component.scss',
})
export class AppModalComponent {
  @Input() open = false;
  @Input() title = '';

  @Output() closed = new EventEmitter<void>();

  onOverlayClick(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
