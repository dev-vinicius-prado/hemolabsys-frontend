import { Injectable, inject } from '@angular/core';
import { ApiService } from 'app/core/api/api.service';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NotificationsService
{
    private _apiService = inject(ApiService);
    private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for notifications
     */
    get notifications$(): Observable<Notification[]>
    {
        return this._notifications.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all notifications
     */
    getAll(): Observable<Notification[]>
    {
        return this._apiService.get<Notification[]>('common/notifications').pipe(
            tap((notifications) =>
            {
                this._notifications.next(notifications);
            }),
        );
    }

    /**
     * Add a notification locally (e.g. from WebSocket)
     *
     * @param notification
     */
    addLocal(notification: Notification): void
    {
        this.notifications$.pipe(take(1)).subscribe(notifications => {
            this._notifications.next([notification, ...notifications]);
        });
    }

    /**
     * Create a notification
     *
     * @param notification
     */
    create(notification: Notification): Observable<Notification>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._apiService.post<Notification>('common/notifications', notification).pipe(
                map((newNotification) =>
                {
                    // Update the notifications with the new notification
                    this._notifications.next([...notifications, newNotification]);

                    // Return the new notification from observable
                    return newNotification;
                }),
            )),
        );
    }

    /**
     * Update the notification
     *
     * @param id
     * @param notification
     */
    update(id: string, notification: Notification): Observable<Notification>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._apiService.patch<Notification>('common/notifications', id, notification).pipe(
                map((updatedNotification: Notification) =>
                {
                    // Find the index of the updated notification
                    const index = notifications.findIndex(item => item.id === id);

                    // Update the notification
                    notifications[index] = updatedNotification;

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated notification
                    return updatedNotification;
                }),
            )),
        );
    }

    /**
     * Delete the notification
     *
     * @param id
     */
    delete(id: string): Observable<boolean>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._apiService.remove('common/notifications', id).pipe(
                map((isDeleted) =>
                {
                    // Find the index of the deleted notification
                    const index = notifications.findIndex(item => item.id === id);

                    // Delete the notification
                    notifications.splice(index, 1);

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): Observable<boolean>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._apiService.get<boolean>('common/notifications/mark-all-as-read').pipe(
                map((isUpdated) =>
                {
                    // Go through all notifications and set them as read
                    notifications.forEach((notification) =>
                    {
                        notification.read = true;
                    });

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated status
                    return isUpdated;
                }),
            )),
        );
    }
}
