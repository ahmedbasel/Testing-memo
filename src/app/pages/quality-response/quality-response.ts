import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { MemoService } from '../../services/memo';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
@Component({
  selector: 'app-quality-response',
  imports: [FormsModule],
  templateUrl: './quality-response.html',
  styleUrl: './quality-response.sass',
})
export class QualityResponse {
   memos: any[] = [];
  loading = true;
  errorMessage = '';
selectedMemo: any = null;
productionComments = '';
qualityDecision = '';
responsePersonInCharge = '';
submitting = false;
successMessage = '';
constructor(
  private memoService: MemoService,
  private notificationService: NotificationService,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit() {
    this.loadMemos();
  }
openMemo(memo: any) {
  this.selectedMemo = memo;

  this.cdr.detectChanges();
}
   async loadMemos() {
    try {
      this.loading = true;
      this.errorMessage = '';

      this.cdr.detectChanges();

     this.memos = await this.memoService.getPendingMemos();

      console.log('Memos:', this.memos);

      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error loading memos:', error);

      this.errorMessage =
        'Unable to load testing memos.';

      this.cdr.detectChanges();

    } finally {
      this.loading = false;

      this.cdr.detectChanges();
    }
  }

async submitResponse() {

  if (this.submitting) {
    return;
  }

  if (
    !this.productionComments.trim() ||
    !this.qualityDecision.trim() ||
    !this.responsePersonInCharge.trim()
  ) {
    this.errorMessage = 'Please fill in all response fields.';
    this.cdr.detectChanges();
    return;
  }

  if (!this.selectedMemo?.id) {
    this.errorMessage = 'No memo selected.';
    this.cdr.detectChanges();
    return;
  }

  this.submitting = true;
  this.errorMessage = '';

  this.cdr.detectChanges();

  try {

    await this.memoService.updateQualityResponse(
      this.selectedMemo.id,
      this.productionComments,
      this.qualityDecision,
      this.responsePersonInCharge
    );
await this.notificationService.createNotification(
  this.selectedMemo.createdBy,
  'Quality Response',
  'You have a new testing memo reply from quality',
  'quality-response',
  this.selectedMemo.id
);

   this.successMessage =
  'Quality response submitted successfully.';

this.memos = this.memos.filter(
  (memo) => memo.id !== this.selectedMemo.id
);

this.selectedMemo = null;

this.productionComments = '';
this.qualityDecision = '';
this.responsePersonInCharge = '';

this.submitting = false;

this.cdr.detectChanges();

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

isResponseValid(): boolean {
  return (
    this.productionComments.trim().length > 0 &&
    this.qualityDecision.trim().length > 0 &&
    this.responsePersonInCharge.trim().length > 0
  );
}
showDeleteModal = false;
memoToDelete: string | null = null;
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

async confirmDelete() {

  if (!this.memoToDelete) {
    return;
  }

  const memoId = this.memoToDelete;

  try {

    await this.memoService.deleteMemo(memoId);

    this.memos = this.memos.filter(
      (memo) => memo.id !== memoId
    );

    this.closeDeleteModal();

  } catch (error) {

    console.error('Error deleting memo:', error);

    this.errorMessage =
      'Unable to delete memo. Please try again.';

    this.closeDeleteModal();

    this.cdr.detectChanges();
  }
}
}
