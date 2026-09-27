import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [FormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.sass',
})
export class Login {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

constructor(
  private authService: AuthService,
  private router: Router
) {}
  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password)
      .then(() => {
        console.log('Login successful');
        this.loading = false;
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.error(error);

        this.loading = false;

        if (error.code === 'auth/invalid-credential') {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Please enter a valid email.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      });
  }
}
