import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MemoService } from '../../services/memo';
@Component({
  selector: 'app-history',
  imports: [],
  templateUrl: './history.html',
  styleUrl: './history.sass',
})
export class History {
   memos: any[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private memoService: MemoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  async loadHistory() {
    try {
      this.loading = true;
      this.errorMessage = '';

      this.cdr.detectChanges();

      const allMemos = await this.memoService.getHistoryMemos();

      this.memos = allMemos.filter(
        (memo: any) => !!memo.qualityResponse
      );

      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error loading history:', error);

      this.errorMessage =
        'Unable to load history.';

      this.cdr.detectChanges();

    } finally {
      this.loading = false;

      this.cdr.detectChanges();
    }
  }
  showDeleteModal = false;
memoToDelete: string | null = null;
openDeleteModal(memoId: string) {
  this.memoToDelete = memoId;
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.memoToDelete = null;
  this.showDeleteModal = false;
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
  }
}
}
