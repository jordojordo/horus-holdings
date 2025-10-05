import { defineStore } from 'pinia';
import { io, type Socket } from 'socket.io-client';
import { getServiceConfig } from '@/utils/service';
import { useAuthStore } from '@/stores/auth';
import type { Router } from 'vue-router';

const CLIENT_NAMESPACE = '/client';

type State = {
  socket: Socket | null
  isConnected: boolean
  sessionExpired: boolean
  inited: boolean
}

export const useSocketStore = defineStore('socket', {
  state: (): State => ({
    socket:         null,
    isConnected:    false,
    sessionExpired: false,
    inited:         false,
  }),

  actions: {
    init(router: Router) {
      if (this.inited) {
        return;
      }

      this.inited = true;

      const auth = useAuthStore();

      this.$subscribe((_mutation, _state) => {
        // no-op; keep to observe socket store changes elsewhere
      });

      // Watch auth state to connect/disconnect
      const stopAuthWatch = auth.$subscribe((_m, s) => {
        if (!s.isLoading && s.authenticated) {
          this.sessionExpired = false;
          this.connect(router);
        } else {
          this.disconnect();
        }
      });

      // Also run once on init to reflect current auth state
      if (!auth.isLoading && auth.authenticated) {
        this.connect(router);
      } else {
        this.disconnect();
      }

      // Cleanup on page unload
      const handleBeforeUnload = () => {
        if (this.socket) {
          this.socket.disconnect();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // Provide a way to fully teardown if ever needed
      this.$onAction(({ name, after }) => {
        if (name === 'destroy') {
          after(() => {
            stopAuthWatch?.();
            window.removeEventListener('beforeunload', handleBeforeUnload);
          });
        }
      });
    },

    connect(router: Router) {
      if (this.socket) {
        return;
      }

      const { wsScheme, wsUrl, wsPath } = getServiceConfig();

      console.log(`[ws] establishing socket connection with: ${ wsUrl }${ wsPath }${ CLIENT_NAMESPACE }`);

      this.socket = io(wsUrl + CLIENT_NAMESPACE, {
        path:       wsPath,
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        this.isConnected = true;

        console.log(`[${ wsScheme }] socket connection established`);
      });

      this.socket.on('disconnect', (reason: string) => {
        this.isConnected = false;

        console.log(`[${ wsScheme }] socket disconnected: ${ reason }`);
      });

      this.socket.on('connect_error', (error: unknown) => {
        console.log(`[${ wsScheme }] socket connection error:`, error);
      });

      // Session expiry event — mirror React behavior
      this.socket.on('token_expired', async() => {
        console.log(`[${ wsScheme }] token expired event received`);

        console.log('Your session has expired. Please log in again.'); // TODO: replace with toaster
        this.sessionExpired = true;

        const auth = useAuthStore();

        await auth.logout();

        router.push('/login');
      });
    },

    disconnect() {
      if (!this.socket) {
        return;
      }

      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    },

    destroy() {
      this.disconnect();
      this.inited = false;
      this.sessionExpired = false;
    },

    sendMessage(payload: unknown, event = 'message') {
      if (this.socket?.connected) {
        this.socket.emit(event, payload);
      }
    },

    setOnMessage(event: string, handler: (data: unknown) => void) {
      if (!this.socket) {
        return;
      }

      this.socket.off(event);
      this.socket.on(event, handler);
    },

    off(event: string, handler?: (data: unknown) => void) {
      if (!this.socket) {
        return;
      }

      // If handler provided, remove that specific one; otherwise remove all for event
      if (handler) {
        this.socket.off(event, handler);
      } else {
        this.socket.off(event);
      }
    },
  },
});
