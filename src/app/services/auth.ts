import { Injectable } from '@angular/core';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { getAuth } from 'firebase/auth';

import {
  Firestore,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { getFirestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth: Auth = getAuth();
  private firestore: Firestore = getFirestore();


  // =========================
  // Current User
  // =========================

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }


  // =========================
  // Auth State
  // =========================

  onAuthStateChanged(callback: (user: User | null) => void) {

    return onAuthStateChanged(
      this.auth,
      (user) => {
        callback(user);
      }
    );

  }


  // =========================
  // Sign Up
  // =========================

  signUp(name: string, email: string, password: string) {

    return createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    ).then(async (userCredential) => {

      const user = userCredential.user;

     await setDoc(
  doc(this.firestore, 'users', user.uid),
  {
    uid: user.uid,
    name: name,
    email: user.email,
    createdAt: serverTimestamp(),
  }
);

      return userCredential;

    });

  }


  // =========================
  // Login
  // =========================

  login(email: string, password: string) {

    return signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

  }


  // =========================
  // Logout
  // =========================

  logout() {

    return signOut(this.auth);

  }

}