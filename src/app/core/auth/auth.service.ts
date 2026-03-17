import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({providedIn: 'root'})
export class AuthService
{
    private _authenticated: boolean = false;
    private _apiService = inject(ApiService);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Setter & getter for refresh token
     *
     * @param token
     */
    set refreshToken(token: string)
    {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string
    {
        return localStorage.getItem('refreshToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._apiService.post('auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._apiService.post('auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('O usuário já está logado.');
        }

        return this._apiService.post('auth/authenticate', credentials).pipe(
            switchMap((response: any) =>
            {
                // Store the access and refresh tokens
                this.accessToken = response.token;
                this.refreshToken = response.refreshToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = this._toUser(response.user);

                // Return a new observable with the response
                return of(response);
            }),
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access and refresh tokens from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Refresh the access token
     */
    refreshAccessToken(): Observable<any>
    {
        return this._apiService.post('auth/refresh-token', {
            refreshToken: this.refreshToken,
        }).pipe(
            catchError(() =>
            {
                // Sign out
                this.signOut();

                // Return false
                return of(false);
            }),
            switchMap((response: any) =>
            {
                // Store the access token
                this.accessToken = response.token;

                // Return true
                return of(true);
            }),
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Sign in using the token
        return this._apiService.post('auth/sign-in-with-token', {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>

                // Return false
                of(false),
            ),
            switchMap((response: any) =>
            {
                // Replace the access token with the new one if it's available on
                // the response object.
                if ( response.token )
                {
                    this.accessToken = response.token;
                }

                if ( response.refreshToken )
                {
                    this.refreshToken = response.refreshToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = this._toUser(response.user);

                // Return true
                return of(true);
            }),
        );
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._apiService.post('auth/register', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._apiService.post('auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    private _toUser(dto: any): User
    {
        const id = dto?.id !== undefined && dto?.id !== null ? String(dto.id) : '';
        const name = dto?.nome ?? dto?.name ?? '';
        const email = dto?.email ?? '';
        const active = dto?.ativo ?? dto?.active ?? true;
        const role = dto?.role ?? '';

        return {
            id,
            name,
            email,
            role,
            birthDate: dto?.birthDate ?? '',
            createdAt: dto?.createdAt ?? '',
            updatedAt: dto?.updatedAt ?? '',
            active,
            empresaId: dto?.empresaId ?? 0,
            phoneNumber: 0
        };
    }
}
