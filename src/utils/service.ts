export interface WebsocketConfig {
  scheme: string;
  host: string;
  port: string;
  path: string;
  apiUrl: string;
  keepAliveInterval?: number;
}

export function getWebsocketConfig(): WebsocketConfig {
  const envScheme = import.meta.env.VITE_WS_SCHEME;
  const envHost = import.meta.env.VITE_WS_HOST;
  const envPort = import.meta.env.VITE_WS_PORT;
  const envPath = import.meta.env.VITE_WS_PATH;
  const apiScheme = import.meta.env.VITE_API_SCHEME;

  const defaultWsScheme = 'wss';
  const defaultApiScheme = 'https';
  const defaultHost = window.location.hostname;
  const defaultPort = '';
  const defaultPath = '/ws';

  const isPlaceholder = (value: string) => {
    // Check if the value contains the '__PLACEHOLDER__' pattern
    return value.includes('__PLACEHOLDER__');
  };

  const scheme = isPlaceholder(envScheme) ? defaultWsScheme : envScheme;
  const host = isPlaceholder(envHost) ? defaultHost : envHost;
  const port = isPlaceholder(envPort) ? defaultPort : envPort;
  const path = isPlaceholder(envPath) ? defaultPath : envPath;

  const resolvedApiScheme = isPlaceholder(apiScheme) ? defaultApiScheme : apiScheme;
  const apiPort = (port && port !== defaultPort) ? `:${ port }` : '';
  const apiUrl = `${ resolvedApiScheme }://${ host }${ apiPort }/api`;

  return {
    scheme,
    host,
    port,
    path,
    apiUrl
  };
}
