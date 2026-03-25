import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(AuthService);

    // Clone the request object
    let newReq = req.clone();

    // Request
    if ( authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken) )
    {
        newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) =>
        {
            // Catch "401 Unauthorized" responses
            if ( error instanceof HttpErrorResponse && error.status === 401 )
            {
                // Check if we have a refresh token
                if ( authService.refreshToken )
                {
                    // Attempt to refresh the access token
                    return authService.refreshAccessToken().pipe(
                        switchMap((refreshed) =>
                        {
                            if ( refreshed )
                            {
                                // Retry the original request with the new token
                                return next(req.clone({
                                    headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
                                }));
                            }

                            // If refresh failed, sign out
                            authService.signOut();
                            location.reload();
                            return throwError(error);
                        }),
                    );
                }

                // If no refresh token, sign out
                authService.signOut();

                // Reload the app
                location.reload();
            }

            return throwError(error);
        }),
    );
};
