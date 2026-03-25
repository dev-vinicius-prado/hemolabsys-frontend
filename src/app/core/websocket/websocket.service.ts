import { Injectable, OnDestroy, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, filter, take } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { Notification } from 'app/layout/common/notifications/notifications.types';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private _authService = inject(AuthService);
    private _notificationsService = inject(NotificationsService);

    private stompClient: Client;
    private _connected$ = new BehaviorSubject<boolean>(false);
    public connected$ = this._connected$.asObservable();

    constructor() {
        this._initWebSocket();
    }

    private _initWebSocket(): void {
        const url = 'http://localhost:8080/ws'; // Ajuste conforme seu backend
        
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(url),
            debug: (str) => {
                console.log('WebSocket Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            console.log('WebSocket Connected');
            this._connected$.next(true);
            this._subscribeToNotifications();
        };

        this.stompClient.onStompError = (frame) => {
            console.error('WebSocket STOMP Error:', frame.headers['message']);
            console.error('Details:', frame.body);
            this._connected$.next(false);
        };

        this.stompClient.onWebSocketClose = () => {
            console.log('WebSocket Connection Closed');
            this._connected$.next(false);
        };

        this.stompClient.activate();
    }

    private _subscribeToNotifications(): void {
        // Subscreve ao tópico de notificações do usuário
        // O backend envia para /user/{email}/queue/notifications
        // O STOMP converte para /user/queue/notifications para o cliente logado
        this.stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
            if (message.body) {
                const notification: Notification = JSON.parse(message.body);
                this._handleNewNotification(notification);
            }
        });
    }

    private _handleNewNotification(notification: Notification): void {
        // Adiciona a nova notificação ao NotificationsService
        this._notificationsService.notifications$.pipe(take(1)).subscribe(currentNotifications => {
            // Adiciona no início da lista (mais recente)
            this._notificationsService['_notifications'].next([notification, ...currentNotifications]);
        });
    }

    ngOnDestroy(): void {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }
}
