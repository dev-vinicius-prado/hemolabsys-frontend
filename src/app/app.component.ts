import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebSocketService } from 'app/core/websocket/websocket.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss'],
    standalone : true,
    imports    : [RouterOutlet],
})
export class AppComponent
{
    private _webSocketService = inject(WebSocketService);

    /**
     * Constructor
     */
    constructor()
    {
    }
}
