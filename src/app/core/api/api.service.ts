import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type Id = string | number;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = 'http://localhost:8080/api';

  private _resolveUrl(path: string): string {
    const isAbsolute = /^https?:\/\//i.test(path);
    return isAbsolute ? path : `${this._baseUrl}/${path.replace(/^\//, '')}`;
  }

  private _toParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null) {
            httpParams = httpParams.append(key, String(v));
          }
        });
      } else if (typeof value === 'object') {
        // For object values, JSON-stringify by default
        httpParams = httpParams.set(key, JSON.stringify(value));
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  // List resources: GET /{path}
  list<T>(path: string, params?: Record<string, unknown>): Observable<T[]> {
    const url = this._resolveUrl(path);
    const httpParams = this._toParams(params);
    return this._http.get<T[]>(url, { params: httpParams });
  }

  // Get single resource: GET /{path}/{id}
  getById<T>(path: string, id: Id, params?: Record<string, unknown>): Observable<T> {
    const url = this._resolveUrl(`${path}/${id}`);
    const httpParams = this._toParams(params);
    return this._http.get<T>(url, { params: httpParams });
  }

  // Query with arbitrary GET: GET /{path}
  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    const url = this._resolveUrl(path);
    const httpParams = this._toParams(params);
    return this._http.get<T>(url, { params: httpParams });
  }

  // Create: POST /{path}
  create<T>(path: string, body: unknown): Observable<T> {
    const url = this._resolveUrl(path);
    return this._http.post<T>(url, body);
  }

  // Create: POST /{path}
  post<T>(path: string, body: unknown): Observable<T> {
    const url = this._resolveUrl(path);
    return this._http.post<T>(url, body);
  }

  // Update: PUT /{path}/{id}
  update<T>(path: string, id: Id, body: unknown): Observable<T> {
    const url = this._resolveUrl(`${path}/${id}`);
    return this._http.put<T>(url, body);
  }

  // Partial update: PATCH /{path}/{id}
  patch<T>(path: string, id: Id, body: unknown): Observable<T> {
    const url = this._resolveUrl(`${path}/${id}`);
    return this._http.patch<T>(url, body);
  }

  // Delete: DELETE /{path}/{id}
  remove<T>(path: string, id: Id, params?: Record<string, unknown>): Observable<boolean> {
    const url = this._resolveUrl(`${path}/${id}`);
    const httpParams = this._toParams(params);
    return this._http.delete<boolean>(url, { params: httpParams });
  }
}

