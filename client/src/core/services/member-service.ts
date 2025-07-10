import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, Photo } from '../../types/member';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  editMode = signal(false);
  member = signal<Member | null>(null);
  
  getMembers() {
    const url = `${this.baseUrl}members`;

    return this.http.get<Member[]>(url);
  }

  getMember(id: string) {
    const url = `${this.baseUrl}members/${id}`;

    return this.http.get<Member>(url)
      .pipe(
        tap(member => this.member.set(member))
      );
  }

  getMemberPhotos(id: string) {
    const url = `${this.baseUrl}members/${id}/photos`;
    
    return this.http.get<Photo[]>(url);
  }

  updateMember(member: EditableMember) {
    const url = `${this.baseUrl}members`;
    
    return this.http.put<void>(url, member);
  }
}
