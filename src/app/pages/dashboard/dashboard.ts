import { AuthService } from './../../services/auth';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.sass',
})
export class Dashboard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  logout() {

    this.authService.logout()
      .then(() => {

        this.router.navigate(['/login']);

      })
      .catch((error) => {

        console.error('Logout error:', error);

      });

  }
}
