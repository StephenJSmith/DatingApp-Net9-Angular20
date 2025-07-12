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

  uploadPhoto(file: File) {
    const url = `${this.baseUrl}members/add-photo`;

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Photo>(url, formData);
  }

  setMainPhoto(photo: Photo) {
    const url = `${this.baseUrl}members/set-main-photo/${photo.id}`;

    return this.http.put<void>(url, {});
  }

  deletePhoto(photoId: number) {
    const url = `${this.baseUrl}members/delete-photo/${photoId}`;

    return this.http.delete<void>(url);
  }
}
