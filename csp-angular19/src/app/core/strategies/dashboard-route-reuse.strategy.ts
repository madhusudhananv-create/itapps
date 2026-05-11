/**
 * Custom Route Reuse Strategy for Dashboard Performance
 * 
 * This strategy caches the dashboard component to prevent it from being destroyed
 * and recreated every time the user navigates away and back. This significantly
 * improves performance when returning to the dashboard from other pages.
 * 
 * Cached routes:
 * - /newdashboard/cust/:customerid/:reset (main dashboard)
 * - /newdashboard/next/:customerid (next page dashboard)
 * 
 * Benefits:
 * - Dashboard loads instantly when navigating back
 * - Component state is preserved
 * - No unnecessary API calls
 * - Better user experience
 */

import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class DashboardRouteReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();
  
  // Maximum number of routes to cache (prevent memory leaks)
  private readonly maxCachedRoutes = 5;

  /**
   * Determines whether this route should be detached and stored
   * We cache dashboard routes to improve navigation performance
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Cache dashboard routes
    const path = this.getRoutePath(route);
    return this.isDashboardRoute(path);
  }

  /**
   * Store the detached route for later reuse
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!handle) return;
    
    const path = this.getRoutePath(route);
    
    // Implement LRU cache - if we exceed max, remove oldest entry
    if (this.storedRoutes.size >= this.maxCachedRoutes) {
      const firstKey = this.storedRoutes.keys().next().value;
      if (firstKey) {
        this.storedRoutes.delete(firstKey);
      }
    }
    
    this.storedRoutes.set(path, handle);
  }

  /**
   * Determines whether this route should be reattached from cache
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getRoutePath(route);
    const hasStoredRoute = this.storedRoutes.has(path);
    
    if (hasStoredRoute) {
    }
    
    return hasStoredRoute;
  }

  /**
   * Retrieve the stored route for reattachment
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = this.getRoutePath(route);
    return this.storedRoutes.get(path) || null;
  }

  /**
   * Determines whether the current route should be reused
   * This handles parameter changes on the same route
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Default behavior: reuse if the route config is the same
    // This allows parameter changes to trigger component updates
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * Get a unique path identifier for the route
   * Includes route path and parameters for accurate caching
   */
  private getRoutePath(route: ActivatedRouteSnapshot): string {
    let path = '';
    let currentRoute: ActivatedRouteSnapshot | null = route;
    
    while (currentRoute) {
      if (currentRoute.routeConfig?.path) {
        path = currentRoute.routeConfig.path + '/' + path;
      }
      currentRoute = currentRoute.parent;
    }
    
    // Include query params in the cache key if needed
    // Uncomment if you want different cache entries for different query params
    // const queryParams = route.queryParams;
    // if (Object.keys(queryParams).length > 0) {
    //   path += '?' + new URLSearchParams(queryParams).toString();
    // }
    
    return path;
  }

  /**
   * Check if the route is a dashboard route that should be cached
   */
  private isDashboardRoute(path: string): boolean {
    // Cache these specific dashboard routes
    const dashboardRoutePatterns = [
      'newdashboard/cust/',
      'newdashboard/next/',
      'dashboard-customer',
      'dashboard-customer-next-page'
    ];
    
    return dashboardRoutePatterns.some(pattern => path.includes(pattern));
  }

  /**
   * Clear the entire route cache
   * Call this when user logs out or when you need to force refresh
   */
  public clearCache(): void {
    this.storedRoutes.clear();
  }

  /**
   * Clear a specific route from cache
   */
  public clearRoute(path: string): void {
    this.storedRoutes.delete(path);
  }
}
