import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  imports: [FormsModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.sass',
})
export class Signup {
   name = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

constructor(
  private authService: AuthService,
  private router: Router
) {}
  signUp() {

    this.errorMessage = '';

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

   this.authService.signUp(
  this.name,
  this.email,
  this.password
)
      .then(() => {

        console.log('Account created successfully');

        this.loading = false;
      

  this.router.navigate(['/login']);


      })
      .catch((error) => {

        console.error(error);

        this.loading = false;

        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'This email is already registered.';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Please enter a valid email.';
        } else if (error.code === 'auth/weak-password') {
          this.errorMessage = 'Password must be at least 6 characters.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }

      });
  }
}
