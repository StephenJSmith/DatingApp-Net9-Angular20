import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member, Photo } from '../../types/member';
import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  
  getMembers() {
    const url = `${this.baseUrl}members`;

    return this.http.get<Member[]>(url);
  }

  getMember(id: string) {
    const url = `${this.baseUrl}members/${id}`;

    return this.http.get<Member>(url);
  }

  getMemberPhotos(id: string) {
    const url = `${this.baseUrl}members/${id}/photos`;
    
    return this.http.get<Photo[]>(url);
  }
}
