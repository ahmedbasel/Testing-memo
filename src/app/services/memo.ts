import { Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

import {
  Auth,
  getAuth,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class MemoService {

  private firestore: Firestore = getFirestore();

  private auth: Auth = getAuth();


  createMemo(memoData: any) {

    const user = this.auth.currentUser;

    if (!user) {
      throw new Error('User is not authenticated');
    }


    const memosCollection = collection(
      this.firestore,
      'memos'
    );


    return addDoc(
      memosCollection,
      {
        ...memoData,

        createdBy: user.uid,

        createdAt: serverTimestamp(),
      }
    );

  }

 async getPendingMemos() {

  const memosCollection = collection(
    this.firestore,
    'memos'
  );

  const memosQuery = query(
    memosCollection,
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(memosQuery);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((memo: any) => !memo.qualityResponse);
}
async updateQualityResponse(
  memoId: string,
  productionComments: string,
  qualityDecision: string,
  personInCharge: string
) {

  const user = this.auth.currentUser;

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const memoRef = doc(
    this.firestore,
    'memos',
    memoId
  );

  await updateDoc(
    memoRef,
    {
      qualityResponse: {
        productionComments,
        qualityDecision,
        personInCharge,
        respondedBy: user.email,
        responseDate: serverTimestamp(),
      },
    }
  );
}
async getHistoryMemos() {

  const memosCollection = collection(
    this.firestore,
    'memos'
  );

  const memosQuery = query(
    memosCollection,
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(memosQuery);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((memo: any) => !!memo.qualityResponse);
}
async deleteMemo(memoId: string) {

  const memoRef = doc(
    this.firestore,
    'memos',
    memoId
  );

  await deleteDoc(memoRef);
}
}