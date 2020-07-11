import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  BASE_PATH = 'http://localhost:3000/auth/'
  private token: string;
  private userId: string;
  private isAuthenticated: boolean = false;
  private timerHandler : any;

  constructor(private http: HttpClient) { }

  getUserId() {
    if(this.userId) {
      return this.userId
    } else {
      return this.getAuthLocally().userId;
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token
  }

  getAuthenticated() {
    return this.isAuthenticated;
  }

  setAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
  }

  doSignUp(email, password) {
    const signUpObj: auth = {
      email: email,
      password: password
    }
    return this.http.post(this.BASE_PATH+"signup", signUpObj);
  }

  onLogin(email, password) {
    const loginObj: auth = {
      email: email,
      password: password
    }
    return this.http.post<{message: string, token: string, expiresIn: number, userId: string}>(this.BASE_PATH+"login", loginObj);
  }

  onLogout() {
    console.log("Logout occurs...");
    this.setToken(null);
    this.setUserId(null);
    this.setAuthenticated(false);
    this.deRegisterLogoutTimer();
    this.clearStorage();
  }

  saveAuthLocally(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('expireAt', data.expireAt.toString());
    localStorage.setItem('userId', data.userId);
  }

  getAuthLocally() {
    return {
      token: localStorage.getItem('token'),
      expireAt: new Date(localStorage.getItem('expireAt')),
      userId: localStorage.getItem('userId')
    }
  }

  clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('expireAt');
    localStorage.removeItem('userId');
  }

  autoLogin() {
    const token = this.getAuthLocally().token;
    const expireAt = this.getAuthLocally().expireAt;

    if(token && expireAt) {
      console.log("Doing auto login...");
      const now = new Date();
      const expiryTime = expireAt.getTime() - now.getTime();
      console.log()
      if(expiryTime > 0) {
        this.setAuthenticated(true);
        this.setToken(token);
        this.deRegisterLogoutTimer();
        this.registerLogoutTimer(expiryTime/1000);
      }
    }
  }

  registerLogoutTimer(expiresIn: number) {
    console.log("Logout will occurs in : "+ expiresIn * 1000)
    this.timerHandler = setTimeout(() => {
      this.onLogout();
    }, expiresIn * 1000);
  }

  deRegisterLogoutTimer() {
    clearTimeout(this.timerHandler);
  }
}
