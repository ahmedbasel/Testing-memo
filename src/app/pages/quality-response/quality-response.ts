import {
  Component,
  ChangeDetectorRef,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MemoService } from '../../services/memo';

import {
  NotificationService,
} from '../../services/notification.service';


@Component({
  selector: 'app-quality-response',
  imports: [FormsModule],
  templateUrl: './quality-response.html',
  styleUrl: './quality-response.sass',
})
export class QualityResponse {

  // =========================
  // MEMOS
  // =========================

  memos: any[] = [];

  loading = true;

  errorMessage = '';

  selectedMemo: any = null;


  // =========================
  // QUALITY RESPONSE
  // =========================

  productionComments = '';

  qualityDecision = '';

  responsePersonInCharge = '';

  submitting = false;

  successMessage = '';


  // =========================
  // DELETE
  // =========================

  showDeleteModal = false;

  memoToDelete: string | null = null;


  constructor(
    private memoService: MemoService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================
  // INIT
  // =========================

  ngOnInit() {
    this.loadMemos();
  }


  // =========================
  // LOAD MEMOS
  // =========================

  async loadMemos() {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.cdr.detectChanges();


      this.memos =
        await this.memoService.getPendingMemos();


      console.log(
        'Testing Memos:',
        this.memos
      );


      this.cdr.detectChanges();

    } catch (error) {

      console.error(
        'Error loading memos:',
        error
      );

      this.errorMessage =
        'Unable to load testing memos.';

      this.cdr.detectChanges();

    } finally {

      this.loading = false;

      this.cdr.detectChanges();
    }
  }


  // =========================
  // OPEN MEMO
  // =========================

  openMemo(memo: any) {

    this.selectedMemo = memo;

    // Reset response fields
    this.productionComments = '';

    this.qualityDecision = '';

    this.responsePersonInCharge = '';

    this.errorMessage = '';

    this.cdr.detectChanges();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  // =========================
  // SUBMIT RESPONSE
  // =========================

  async submitResponse() {

    if (this.submitting) {
      return;
    }


    // Validate response
    if (!this.isResponseValid()) {

      this.errorMessage =
        'Please fill in all response fields.';

      this.cdr.detectChanges();

      return;
    }


    // Validate selected memo
    if (!this.selectedMemo?.id) {

      this.errorMessage =
        'No memo selected.';

      this.cdr.detectChanges();

      return;
    }


    this.submitting = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    try {

      // Update Firestore
      await this.memoService.updateQualityResponse(
        this.selectedMemo.id,
        this.productionComments.trim(),
        this.qualityDecision.trim(),
        this.responsePersonInCharge.trim()
      );


      // Notify Testing user
      await this.notificationService.createNotification(
        this.selectedMemo.createdBy,

        'Quality Response',

        'You have a new testing memo reply from quality',

        'quality-response',

        this.selectedMemo.id
      );


      // Success
      this.successMessage =
        'Quality response submitted successfully.';


      // Remove completed memo from pending list
      this.memos =
        this.memos.filter(
          (memo) =>
            memo.id !== this.selectedMemo.id
        );


      // Close memo
      this.selectedMemo = null;


      // Clear response fields
      this.productionComments = '';

      this.qualityDecision = '';

      this.responsePersonInCharge = '';


      this.submitting = false;

      this.cdr.detectChanges();


      // Hide success message
      setTimeout(() => {

        this.successMessage = '';

        this.cdr.detectChanges();

      }, 1500);


    } catch (error) {

      console.error(
        'Error submitting quality response:',
        error
      );

      this.errorMessage =
        'Unable to submit quality response. Please try again.';

      this.submitting = false;

      this.cdr.detectChanges();
    }
  }


  // =========================
  // RESPONSE VALIDATION
  // =========================

  isResponseValid(): boolean {

    return (
      this.productionComments.trim().length > 0 &&
      this.qualityDecision.trim().length > 0 &&
      this.responsePersonInCharge.trim().length > 0
    );
  }


  // =========================
  // DELETE MODAL
  // =========================

  openDeleteModal(memoId: string) {

    this.memoToDelete = memoId;

    this.showDeleteModal = true;

    this.cdr.detectChanges();
  }


  closeDeleteModal() {

    this.memoToDelete = null;

    this.showDeleteModal = false;

    this.cdr.detectChanges();
  }


  // =========================
  // DELETE MEMO
  // =========================

  async confirmDelete() {

    if (!this.memoToDelete) {
      return;
    }


    const memoId =
      this.memoToDelete;


    try {

      await this.memoService.deleteMemo(
        memoId
      );


      this.memos =
        this.memos.filter(
          (memo) =>
            memo.id !== memoId
        );


      // If the deleted memo is currently open
      if (
        this.selectedMemo?.id === memoId
      ) {

        this.selectedMemo = null;

        this.productionComments = '';

        this.qualityDecision = '';

        this.responsePersonInCharge = '';
      }


      this.closeDeleteModal();

      this.cdr.detectChanges();


    } catch (error) {

      console.error(
        'Error deleting memo:',
        error
      );

      this.errorMessage =
        'Unable to delete memo. Please try again.';

      this.closeDeleteModal();

      this.cdr.detectChanges();
    }
  }
}