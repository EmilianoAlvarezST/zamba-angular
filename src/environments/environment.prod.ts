import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true,
  apiRestBasePath: 'http://www.zamba.com.ar/zambaweb.restapi/api/Dashboard',
  apiWebViews: 'http://www.zamba.com.ar/zamba.web/Views',
  zambaWeb: 'http://www.zamba.com.ar/Zamba.Web',
  cliente: 'zamba',
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  }
} as Environment;
