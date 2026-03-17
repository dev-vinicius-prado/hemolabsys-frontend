import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        let user = value;

        // Set the avatar
        if (user && !user.avatar) {
            user.avatar = 'assets/images/avatars/brian-hughes.jpg';
        }

        // Set the status
        if (user && user.active) {
            user.status = 'online';
        } else if (user && !user.active) {
            user.status = 'offline';
        }

        // Store the value
        this._user.next(user);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<any>('api/users/me').pipe(
            map((dto) => {
                const user = this._toUser(dto);
                this._user.next(user);
                return user;
            })
        );
    }

    /**
     * Mapper to convert DTO to User interface
     * @param dto
     * @private
     */
    private _toUser(dto: any): User {
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
            phoneNumber: dto?.phoneNumber ?? 0
        };
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/users/me', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
