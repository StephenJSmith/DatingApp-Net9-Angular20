import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getUserWithRoles() {
    const url = `${this.baseUrl}admin/users-with-roles`;
    
    return this.http.get<User[]>(url);
  }

  updateUserRoles(userId: string, roles: string[]) {
    const url = `${this.baseUrl}admin/edit-roles/${userId}?roles=${roles.join(',')}`;

    return this.http.post<string[]>(url, {});
  }
}
