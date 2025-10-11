export interface ServiceConfig {
  wsScheme: string;
  wsUrl:    string;
  wsPath:   string;
  apiUrl:   string;
}

export function getServiceConfig(): ServiceConfig {
  const {
    VITE_WS_SCHEME: envWsScheme,
    VITE_API_SCHEME: envApiScheme,
    VITE_WS_HOST: envHost,
    VITE_WS_PORT: envPort,
    VITE_WS_PATH: envPath,
  } = import.meta.env;

  const defaultConfig = {
    wsScheme:  'wss',
    apiScheme: 'https',
    host:      window.location.hostname,
    port:      '',
    path:      '/ws',
  };

  const isPlaceholder = (value?: string): boolean => value?.includes('__PLACEHOLDER') ?? false;

  const wsScheme = envWsScheme && !isPlaceholder(envWsScheme) ? envWsScheme : defaultConfig.wsScheme;
  const apiScheme = envApiScheme && !isPlaceholder(envApiScheme) ? envApiScheme : defaultConfig.apiScheme;
  const host = envHost && !isPlaceholder(envHost) ? envHost : defaultConfig.host;
  const port = envPort && !isPlaceholder(envPort) ? `:${ envPort }` : defaultConfig.port;
  const path = envPath && !isPlaceholder(envPath) ? envPath : defaultConfig.path;

  const wsUrl = `${ wsScheme }://${ host }${ port }`;
  const wsPath = path.startsWith('/') ? path : `/${ path }`;
  const apiUrl = `${ apiScheme }://${ host }${ port }/api/v1`;

  return {
    wsScheme,
    wsUrl,
    wsPath,
    apiUrl
  };
}
