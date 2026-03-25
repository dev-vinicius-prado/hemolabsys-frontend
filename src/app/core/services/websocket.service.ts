import { environment } from "app/environments/environment";

// services/websocket.service.ts
// @Injectable({ providedIn: 'root' })
export class WebsocketService {
//   private stompClient: Stomp.Client;

  constructor() {
    this.connect();
  }

  connect(): void {
    // const socket = new SockJS(`${environment.wsUrl}/dashboard`);
    // this.stompClient = Stomp.over(socket);

    // this.stompClient.connect({}, () => {
    //   this.stompClient.subscribe('/topic/estoque', (message) => {
    //     const update = JSON.parse(message.body);
    //     // Emitir para componentes interessados
    //   });

    //   this.stompClient.subscribe('/topic/alertas', (message) => {
    //     const alerta = JSON.parse(message.body);
    //     // Emitir para componentes interessados
    //   });
    // });
  }
}
