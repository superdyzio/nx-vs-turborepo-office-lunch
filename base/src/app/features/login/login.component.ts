import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppInputComponent } from '../../shared/components/input/app-input.component';
import { AppButtonComponent } from '../../shared/components/button/app-button.component';

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
