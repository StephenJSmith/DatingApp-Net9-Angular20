import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../core/services/message-service';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Paginator } from '../../shared/paginator/paginator';

@Component({
  selector: 'app-messages',
  imports: [RouterLink, DatePipe, Paginator],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit {
  private messageService = inject(MessageService);
  protected container = 'Inbox';
  protected fetchedContainer = 'Inbox';
  protected pageNumber = 1;
  protected pageSize = 10;
  protected paginatedMessages = signal<PaginatedResult<Message> | null>(null);

  tabs = [
    {label: 'Inbox', value: 'Inbox'},
    {label: 'Outbox', value: 'Outbox'},
  ];

  get isInbox() {
    return this.fetchedContainer === 'Inbox';
  }

  ngOnInit() : void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.container, this.pageNumber, this.pageSize)
      .subscribe(response => {
        this.paginatedMessages.set(response);
        this.fetchedContainer = this.container;
        console.log(response);
      });
  }

  setContainer (container: string) {
    this.container = container;
    this.pageNumber = 1;
    this.loadMessages();
  }

  onPageChange(event: { pageNumber: number, pageSize: number }) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadMessages();
  }

  deleteMessage(event: Event, id: string) {
    event.stopPropagation();

    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        const current = this.paginatedMessages();
        if (current?.items) {
          this.paginatedMessages.update(prev => {
            if (!prev) return null;

            const newItems = prev.items.filter(x => x.id !== id) || [];

            return {
              items: newItems,
              metadata: prev.metadata   // NOT updating metadata
            }
          })
        }
      }
    })
  }
}
