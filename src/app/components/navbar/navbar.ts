import { AuthService } from './../../services/auth';
import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';


import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  NotificationService,
  NotificationItem,
} from '../../services/notification.service';


@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.sass',
})
export class Navbar {
   userName = '';
  userEmail = '';

  mobileMenuOpen = false;

    constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,

  ) {}

  


  notifications: NotificationItem[] = [];

  notificationOpen = false;

  private unsubscribeNotifications:
    (() => void) | null = null;



async ngOnInit() {

  console.log('🔥 NAVBAR INIT');

  const user =
    this.authService.getCurrentUser();

  console.log(
    '🔥 NAVBAR USER:',
    user?.uid
  );

  if (!user) {
    return;
  }

  this.userEmail =
    user.email || '';

  const firestore =
    getFirestore();

  const userRef =
    doc(
      firestore,
      'users',
      user.uid
    );

  const snapshot =
    await getDoc(userRef);

  if (snapshot.exists()) {

    const data =
      snapshot.data();

    this.userName =
      data['name'] ||
      this.userEmail;

  } else {

    this.userName =
      this.userEmail;
  }

  console.log(
    '🔥 STARTING NOTIFICATIONS'
  );

  this.startNotifications();
}

 startNotifications() {

  console.log(
    '🔥 START NOTIFICATIONS'
  );

  if (this.unsubscribeNotifications) {
    this.unsubscribeNotifications();
    this.unsubscribeNotifications = null;
  }

  this.unsubscribeNotifications =
    this.notificationService.listenToNotifications(
      (notifications) => {

        console.log(
          '🔥 NOTIFICATIONS RECEIVED:',
          notifications
        );

        this.notifications =
          notifications;

        this.cdr.detectChanges();
      }
    );
}
  get unreadCount(): number {

    return this.notifications.filter(
      notification =>
        !notification.isRead
    ).length;
  }

  toggleNotifications() {

    this.notificationOpen =
      !this.notificationOpen;
  }

  async markAsRead(
    notification: NotificationItem
  ) {

    if (notification.isRead) {
      return;
    }

    await this.notificationService
      .markAsRead(notification.id);
  }

  async markAllAsRead() {

    await this.notificationService
      .markAllAsRead();
  }

  

  toggleMobileMenu() {

    this.mobileMenuOpen =
      !this.mobileMenuOpen;
  }

  closeMobileMenu() {

    this.mobileMenuOpen = false;
  }

  ngOnDestroy() {

    if (this.unsubscribeNotifications) {
      this.unsubscribeNotifications();
    }
  }


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