import { Injectable } from '@angular/core';
import {  CanActivate,  } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public authenticator: AdminAuthenticatorService) {}

  canActivate(): boolean {
    // Check if the user is authenticated (e.g., by checking the password).
    const isAuthenticated = this.isPasswordGood(); // Implement your authentication logic here

    if (isAuthenticated) {
      return true;
    } else {
      // If not authenticated, redirect to the login page (or any other route).
      return false;
    }
  }

  isPasswordGood(): boolean {
    // Implement your password validation logic here.
    // For now, we are checking if the password is 'admin'.
    
    return this.authenticator.isPasswordGood();
  }
}
