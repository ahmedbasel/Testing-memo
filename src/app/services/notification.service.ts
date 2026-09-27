import { Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  writeBatch,
  getDoc,
  getDocs
} from 'firebase/firestore';

import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { EmailService } from './email.service';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  memoId?: string;
  isRead: boolean;
  createdAt: any;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private firestore: Firestore = getFirestore();
  private auth = getAuth();

  constructor(
    private emailService: EmailService
  ) {}

async createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  memoId?: string
) {

  const notificationsCollection =
    collection(
      this.firestore,
      'notifications'
    );

  await addDoc(
    notificationsCollection,
    {
      userId,
      title,
      message,
      type,
      memoId: memoId || null,
      isRead: false,
      createdAt: serverTimestamp(),
    }
  );

  const userRef = doc(
    this.firestore,
    'users',
    userId
  );

  const userSnapshot =
    await getDoc(userRef);

  if (userSnapshot.exists()) {

    const userData =
      userSnapshot.data();

    const userEmail =
      userData['email'];

    if (userEmail) {

      await this.emailService.sendNotificationEmail(
        userEmail,
        message
      );

    }
  }
}

  listenToNotifications(
    callback: (notifications: NotificationItem[]) => void
  ) {

    console.log('🔥 LISTENER STARTED');

    const user = this.auth.currentUser;

    console.log(
      '🔥 CURRENT USER UID:',
      user?.uid
    );

    if (!user) {

      console.log('❌ NO CURRENT USER');

      callback([]);

      return () => {};
    }

    const notificationsCollection =
      collection(
        this.firestore,
        'notifications'
      );

    const notificationsQuery =
      query(
        notificationsCollection,
        where(
          'userId',
          '==',
          user.uid
        )
      );

    console.log(
      '🔥 QUERY USER ID:',
      user.uid
    );

    return onSnapshot(
      notificationsQuery,

      (snapshot) => {

        console.log(
          '🔥 SNAPSHOT SIZE:',
          snapshot.size
        );

        console.log(
          '🔥 ALL DOCS:',
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );

        const notifications =
          snapshot.docs.map(
            (item) => ({
              id: item.id,
              ...item.data(),
            })
          ) as NotificationItem[];

        notifications.sort((a, b) => {

          const aTime =
            a.createdAt?.toMillis?.() ?? 0;

          const bTime =
            b.createdAt?.toMillis?.() ?? 0;

          return bTime - aTime;
        });

        callback(notifications);
      },

      (error) => {

        console.error(
          '❌ NOTIFICATION ERROR:',
          error
        );

        callback([]);
      }
    );
  }

  async markAsRead(
    notificationId: string
  ) {

    const notificationRef = doc(
      this.firestore,
      'notifications',
      notificationId
    );

    await updateDoc(
      notificationRef,
      {
        isRead: true,
      }
    );
  }

  async markAllAsRead() {

    const user = this.auth.currentUser;

    if (!user) {
      return;
    }

    const notificationsCollection =
      collection(
        this.firestore,
        'notifications'
      );

    const notificationsQuery =
      query(
        notificationsCollection,
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );

    const snapshot =
      await getDocs(
        notificationsQuery
      );

    const batch =
      writeBatch(
        this.firestore
      );

    snapshot.docs.forEach(
      (notification) => {

        batch.update(
          notification.ref,
          {
            isRead: true,
          }
        );

      }
    );

    await batch.commit();
  }

  async createNotificationForAllUsers(
  title: string,
  message: string,
  type: string,
  memoId?: string,
  excludeUserId?: string
) {

    const usersCollection =
      collection(
        this.firestore,
        'users'
      );

    const snapshot =
      await getDocs(
        usersCollection
      );

    const batch =
      writeBatch(
        this.firestore
      );

    const emailPromises: Promise<void>[] = [];

   snapshot.docs.forEach((userDoc) => {

  if (excludeUserId && userDoc.id === excludeUserId) {
    return;
  }

  const userData = userDoc.data();

  const notificationRef =
    doc(
      collection(
        this.firestore,
        'notifications'
      )
    );

  batch.set(
    notificationRef,
    {
      userId: userDoc.id,
      title,
      message,
      type,
      memoId: memoId || null,
      isRead: false,
      createdAt: serverTimestamp(),
    }
  );

  const userEmail = userData['email'];

  if (userEmail) {

    emailPromises.push(
      this.emailService.sendNotificationEmail(
        userEmail,
        message
      )
    );

  }

});

    // Save all notifications
    await batch.commit();

    // Send all emails
    if (emailPromises.length > 0) {

      const results =
        await Promise.allSettled(
          emailPromises
        );

      console.log(
        '📧 EMAIL RESULTS:',
        results
      );

    }
  }
}