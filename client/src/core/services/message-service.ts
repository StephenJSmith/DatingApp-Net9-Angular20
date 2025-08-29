import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getMessages(container: string, pageNumber: number, pageSize: number) {
  let params  = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('container', container);

    const url = `${this.baseUrl}messages`;
    
    return this.http.get<PaginatedResult<Message>>(url, {params});
  }

  getMessageThread(memberId: string) {
    const url = `${this.baseUrl}messages/thread/${memberId}`;

    return this.http.get<Message[]>(url);
  }

  sendMessage(recipientId: string, content: string) {
    const url = `${this.baseUrl}messages`;

    return this.http.post<Message>(url, {
      recipientId,
      content
    });
  }

  deleteMessage(id: string) {
    const url = `${this.baseUrl}messages/${id}`;

    return this.http.delete<Message>(url);
  }
}
