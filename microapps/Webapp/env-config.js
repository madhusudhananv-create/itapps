/**
 * IT Apps - Environment Configuration
 * Azure AD OAuth 2.0 Configuration for Pipeline Analytics
 * 
 * This file contains environment-specific settings for authentication.
 * Update these values based on your deployment environment.
 * 
 * @version 1.0.0
 * @lastUpdated 2026-06-19
 */

const ENV_CONFIG = {
  /**
   * Environment identifier
   * Options: 'development', 'test', 'uat', 'production'
   */
  environment: 'development',

  /**
   * Azure AD OAuth 2.0 Configuration
   * These credentials are used for SSO authentication
   */
  azureAD: {
    // Development Configuration
    development: {
      clientId: '839af47e-325a-4614-8d2d-6a16299c7d0a',
      tenantId: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      clientSecret: '', // Not used for client-side authentication (PKCE flow)
      authority: 'https://login.microsoftonline.com/2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      scopes: ['User.Read', 'openid', 'profile', 'email']
    }
    
    // // Test Configuration
    // test: {
      // clientId: '1ec38881-7f3b-45b3-9c03-a56981573c4a',
      // tenantId: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      // clientSecret: '', // Should be stored on backend only
      // authority: 'https://login.microsoftonline.com/2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      // scopes: ['User.Read', 'openid', 'profile', 'email']
    // },
    
    // // UAT Configuration
    // uat: {
      // clientId: 'aacc7c9c-0f59-469c-b119-41592a582024',
      // tenantId: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      // clientSecret: '', // Should be stored on backend only
      // authority: 'https://login.microsoftonline.com/2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      // scopes: ['User.Read', 'openid', 'profile', 'email']
    // },
    
    // // Production Configuration
    // production: {
      // clientId: '4cb4a785-a0f4-4db6-8545-6a86ee2b9e19',
      // tenantId: '2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      // clientSecret: '', // Should be stored on backend only
      // authority: 'https://login.microsoftonline.com/2ce2daff-4e86-4a36-a7e3-6aa2a22bf4d1',
      // scopes: ['User.Read', 'openid', 'profile', 'email']
    // }
  },

  /**
   * Application URLs
   */
  urls: {
    development: {
      baseUrl: 'http://localhost:4201',
      login: '/login',
      homepage: '/homepage',
      authCallback: '/homepage',
      microapps: '/microapps.html',
      pipelineAnalytics: '/sales/pipeline_analytics.html',
	  bmsDashboard: '/admin/bookmyseat/'
    },
    production: {
      baseUrl: 'https://itapps.neurealm.com',
      login: '/login',
      homepage: '/homepage',
      authCallback: '/homepage',
      microapps: '/microapps.html',
      pipelineAnalytics: '/sales/pipeline_analytics.html',
	  bmsDashboard: '/admin/bookmyseat/'
    }
  },

  /**
   * Backend API Configuration
   */
  api: {
    development: {
      tokenExchangeEndpoint: 'http://localhost:53505/api/Auth/AzureADTokenExchange'
    },
    production: {
      tokenExchangeEndpoint: 'https://csmapi.neurealm.com/api/Auth/AzureADTokenExchange'
    }
  },

  /**
   * Storage Configuration
   */
  storage: {
    tokenKey: 'token',
    empidKey: 'empid',
    displaynameKey: 'displayname',
    logintypeKey: 'logintype',
    navigateurlKey: 'navigateurl'
  }
};

/**
 * Get current environment configuration
 */
function getCurrentConfig() {
  const env = ENV_CONFIG.environment;
  return {
    azureAD: ENV_CONFIG.azureAD[env],
    urls: ENV_CONFIG.urls[env === 'development' ? 'development' : 'production'],
    api: ENV_CONFIG.api[env === 'development' ? 'development' : 'production'],
    storage: ENV_CONFIG.storage
  };
}

/**
 * Get Azure AD configuration for current environment
 */
function getAzureADConfig() {
  const config = getCurrentConfig();
  return {
    clientId: config.azureAD.clientId,
    tenantId: config.azureAD.tenantId,
    authority: config.azureAD.authority,
    redirectUri: window.location.origin + '/homepage',  // Use /homepage as registered in Azure AD
    scopes: config.azureAD.scopes
  };
}

/**
 * Get redirect URLs
 */
function getRedirectUrls() {
  const config = getCurrentConfig();
  return {
    login: config.urls.login,
    homepage: config.urls.homepage,
    authCallback: config.urls.authCallback,
    microapps: config.urls.microapps,
    pipelineAnalytics: config.urls.pipelineAnalytics,
	bmsDashboard: config.urls.bmsDashboard
  };
}

/**
 * Get API endpoints
 */
function getApiEndpoints() {
  const config = getCurrentConfig();
  return {
    tokenExchange: config.api.tokenExchangeEndpoint
  };
}

/**
 * Get storage keys
 */
function getStorageKeys() {
  return ENV_CONFIG.storage;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ENV_CONFIG = ENV_CONFIG;
  window.getCurrentConfig = getCurrentConfig;
  window.getAzureADConfig = getAzureADConfig;
  window.getRedirectUrls = getRedirectUrls;
  window.getApiEndpoints = getApiEndpoints;
  window.getStorageKeys = getStorageKeys;
}

// Export for Node.js/module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ENV_CONFIG,
    getCurrentConfig,
    getAzureADConfig,
    getRedirectUrls,
    getApiEndpoints,
    getStorageKeys
  };
}
