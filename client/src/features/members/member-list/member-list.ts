import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from "../member-card/member-card";
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from "../../../shared/paginator/paginator";
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;
  private membersService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();
  protected canHideFilters = computed(() => !this.paginatedMembers());
  private updatedParams = new MemberParams();

  get displayMessage(): string {
    const defaultParams = new MemberParams();
    const filters: string[] = [];

    if (this.updatedParams.gender) {
      filters.push(`Gender: ${this.updatedParams.gender}s`);
    } else {
      filters.push('Males, Females');
    }

    if (this.updatedParams.minAge !== defaultParams.minAge
      || this.updatedParams.maxAge !== defaultParams.maxAge) {
      filters.push(` ages ${this.updatedParams.minAge}-${this.updatedParams.maxAge}`);
    }

    filters.push(this.updatedParams.orderBy == 'lastActive' 
      ? 'Last active' 
      : 'Newest members');

    const message = filters.length > 0
      ? `Selected: ${filters.join('  | ')}`
      : 'All';

    return message;
  }

  constructor() {
    const filters = localStorage.getItem('filters');
    if (!filters) return;

    this.memberParams = JSON.parse(filters);
    this.updatedParams = JSON.parse(filters);
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  onPageChange(event: {pageNumber: number, pageSize: number}) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  loadMembers() {
    this.membersService
      .getMembers(this.memberParams)
      .subscribe(result => this.paginatedMembers.set(result));
  }

  openModal() {
    this.modal.open();
  }

  onClose() {
    console.log('Modal closed');
  }

  onFilterChange(data: MemberParams) {
    this.memberParams = {...data};
    this.updatedParams = {...data};
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.updatedParams = new MemberParams();
    this.loadMembers();
  }
}
