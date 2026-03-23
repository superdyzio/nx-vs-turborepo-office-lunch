import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@office-lunch/auth';
import { AppInputComponent } from '@office-lunch/shared/ui';
import { AppButtonComponent } from '@office-lunch/shared/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AppInputComponent, AppButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly errorMessage = signal('');

  onLogin(): void {
    const success = this.auth.login(this.username(), this.password());
    if (success) {
      this.errorMessage.set('');
      const destination = this.auth.isAdmin() ? '/admin/dashboard' : '/departure';
      this.router.navigate([destination]);
    } else {
      this.errorMessage.set('Invalid username or password.');
    }
  }
}
