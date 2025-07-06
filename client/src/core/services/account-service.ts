import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  baseUrl = 'https://localhost:5001/api/';
  currentUser = signal<User | null>(null);

  register(creds: RegisterCreds) {
    const url = `${this.baseUrl}account/register`;

    return this.http
      .post<User>(url, creds)
      .pipe(
        tap(user => {
          if (user) {
            this.setCurrentUser(user);
          }
        })
      );
  }

  login(creds: LoginCreds) {
    const url = `${this.baseUrl}account/login`;

    return this.http
      .post<User>(url, creds)
      .pipe(
        tap(user => {
          if (user) {
            this.setCurrentUser(user);
          }
        })
      );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
