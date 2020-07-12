import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { error } from 'protractor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoading = false
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  onLogin(form: NgForm) {
    if(form.invalid) {
      return
    }
    this.isLoading = true;
    this.authService.onLogin(form.value.email, form.value.password).subscribe(result => {
      console.log(result);
      this.authService.setToken(result.token)
      this.authService.setUserId(result.userId);
      this.authService.setAuthenticated(true);
      const now = new Date();
      const expireAt = new Date(now.getTime() + result.expiresIn * 1000);

      const authObj = {
        token: result.token,
        expireAt: expireAt,
        userId: result.userId
      }

      this.authService.saveAuthLocally(authObj);

      this.authService.registerLogoutTimer(result.expiresIn);

      this.router.navigate(['/students']);
    }, error => {
      this.isLoading = false;
    })

    form.resetForm()
  }

}
