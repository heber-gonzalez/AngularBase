import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, Subscription, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UrlMaster } from '../../services/url-master.service';
import { AuthService } from '../../services/auth/auth.service';
import { TokenManagerService } from '../../services/token-manager/token-manager.service';
@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;
  subscription: Subscription;
  constructor(
    private urlMaster: UrlMaster, 
    private auth: AuthService, 
    private router: Router,
    private tokenManager:TokenManagerService,
  ) { }
  

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = request;
    console.log('intercepted request ... ');
    if (this.isInBlockedList(request.url)) {
      ////console.log('No se agrega token');
      ////console.log(request.url);
      
      return next.handle(request);
    } else {
        ////console.log('Se agrega token');
        authReq = this.addToken(request);
        return next.handle(authReq).pipe(catchError(error => {
          ////console.log(error);
          if (error instanceof HttpErrorResponse && error.status === 401) {
            //console.log('Error 401');
            return this.handle401Error(authReq, next);
          }
          return throwError(() => error);
        }));
    }
  }

  private isInBlockedList(url: string): Boolean {
    const blockedList = [
      this.urlMaster.baseURL + 'auth/user/login',
      this.urlMaster.baseURL + 'auth/user/refresh'
    ];
    return blockedList.includes(url);
  }

  private addToken(req: HttpRequest<any>) {
    return req.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.tokenManager.obtenerAccessToken()}`
      })
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    
    if(!this.isRefreshingToken) {
      this.tokenSubject.next(null);
      this.isRefreshingToken = true;
      return from(this.tokenManager.refrescarTokens()).pipe(
        switchMap(tokens => {
          if(tokens) {
            this.isRefreshingToken = false;
            this.tokenSubject.next(this.tokenManager.obtenerAccessToken());
            return next.handle(this.addToken(request));
          }
          this.auth.cerrarSesion();
          this.router.navigate(['/login']);
          return throwError(() => 'Sesión expirada. Por favor, inicie sesión nuevamente');
        })
      );
    }
    else {
      return this.tokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          // Perform the request again now that we got a new token!
          return next.handle(this.addToken(request));
        })
      );
    }
  }

}
