import { Component, computed, input, model, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css'
})
export class Paginator {
  pageNumber = model(1);
  pageSize = model(10);
  totalCount = input(0);
  totalPages = input(0);
  pageSizeOptions = input([5, 10, 20, 50]);
  protected isFirstPage = computed(() => this.pageNumber() === 1);
  protected isLastPage = computed(() => this.pageNumber() >= this.totalPages());
  protected prevPageNumber = computed(() => this.pageNumber() - 1);
  protected nextPageNumber = computed(() => this.pageNumber() + 1);

  pageChange = output<
    {pageNumber: number, pageSize: number}>();
  lastItemIndex = computed(() =>
    Math.min(this.pageNumber() * this.pageSize(), this.totalCount())
  );

  onPageChange(newPage?: number, pageSize?: EventTarget | null) {
    if (newPage) this.pageNumber.set(newPage);
    if (pageSize) {
      const size = Number((pageSize as HTMLSelectElement).value);
      this.pageSize.set(size);
    }

    this.pageChange.emit({
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize()
    });
  }
}
