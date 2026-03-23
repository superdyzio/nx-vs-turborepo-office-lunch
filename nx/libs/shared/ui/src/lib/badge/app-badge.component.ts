import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './app-badge.component.html',
  styleUrl: './app-badge.component.scss',
})
export class AppBadgeComponent {
  @Input() text = '';
  @Input() color: 'green' | 'red' | 'gray' = 'gray';
}
