import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemoService } from '../../services/memo';

@Component({
  selector: 'app-history',
  imports: [FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.sass',
})
export class History {

  memos: any[] = [];

  loading = true;
  errorMessage = '';

  selectedMemo: any = null;

  searchTerm = '';
  selectedMonth = 'all';

  showDeleteModal = false;
  memoToDelete: string | null = null;

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

      const allMemos =
        await this.memoService.getHistoryMemos();

      this.memos = allMemos.filter(
        (memo: any) => !!memo.qualityResponse
      );

      this.cdr.detectChanges();

    } catch (error) {

      console.error(
        'Error loading history:',
        error
      );

      this.errorMessage =
        'Unable to load history.';

      this.cdr.detectChanges();

    } finally {

      this.loading = false;

      this.cdr.detectChanges();
    }
  }


  get filteredMemos(): any[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.memos.filter(
      (memo: any) => {

        // Work Order filter
        const workOrder =
          memo.groups?.[0]?.workOrder
            ?.toLowerCase() || '';

        const matchesWorkOrder =
          !search ||
          workOrder.includes(search);


        // Month filter
        let matchesMonth = true;

        if (
          this.selectedMonth !== 'all' &&
          memo.createdAt
        ) {

          const date =
            memo.createdAt.toDate
              ? memo.createdAt.toDate()
              : new Date(memo.createdAt);

          const month =
            date.getMonth();

          const year =
            date.getFullYear();

          const [selectedYear, selectedMonthNumber] =
            this.selectedMonth
              .split('-')
              .map(Number);

          matchesMonth =
            year === selectedYear &&
            month === selectedMonthNumber;
        }

        return (
          matchesWorkOrder &&
          matchesMonth
        );
      }
    );
  }


  openMemo(memo: any) {

    this.selectedMemo = memo;

    this.cdr.detectChanges();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  closeMemo() {

    this.selectedMemo = null;

    this.cdr.detectChanges();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


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

      if (
        this.selectedMemo?.id === memoId
      ) {
        this.selectedMemo = null;
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