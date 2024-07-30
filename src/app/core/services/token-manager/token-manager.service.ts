import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlMaster } from '../url-master.service';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import * as jwt_decode from "jwt-decode";
import { Tokens } from '../../models/auth/token.model';


@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {

  constructor(
    private http:HttpClient,
    private urlMaster:UrlMaster,
    private router:Router,
  ) { }

  private accessToken: any;
	private refreshToken: any;

  public async inicializarApp() : Promise<boolean> {
    // console.log('inicializarApp');
    const access_token = localStorage.getItem('ACCESS_TOKEN_KEY');
		const refresh_token = localStorage.getItem('REFRESH_TOKEN_KEY');
    if (access_token && refresh_token) {
      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      if(this.validarExpiracion()) {
        // console.log('Token valido');
        return Promise.resolve(true);
      }
      // console.log('Token invalido');
      const tokens = await this.refrescarTokens();
      if(tokens) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }


  public async refrescarTokens() : Promise<Tokens> {
    try {
      const tokens:Tokens = await firstValueFrom(this.performRefresh());
      this.actualizarTokens(tokens);
      return tokens;
    } catch (error) {
      
      console.log(error);
      this.eliminarTokens();

      return null;
    }

  }

  private performRefresh() : Observable<Tokens> {
    return this.http.post<Tokens>(`${this.urlMaster.baseURL}auth/user/refresh`, {refreshToken: this.refreshToken});

  }

  public actualizarTokens(tokens: Tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('ACCESS_TOKEN_KEY', this.accessToken);
    localStorage.setItem('REFRESH_TOKEN_KEY', this.refreshToken);
  }

  public async eliminarTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('ACCESS_TOKEN_KEY');
    localStorage.removeItem('REFRESH_TOKEN_KEY');
    this.router.navigateByUrl('login', { replaceUrl: true });
  }

  public obtenerAccessToken() {
    return this.accessToken;
  }

  public obtenerRefreshToken() {
    return this.refreshToken;
  }

  private decodificarToken() {
    return jwt_decode.jwtDecode(this.accessToken);
  }

  public obtenerGrupos() {
    return this.decodificarToken()['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  }

  public obtenerNombre() {
    return this.decodificarToken()['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
  }

  public obtenerID() {
    return this.decodificarToken()['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  }

  private validarExpiracion() {
    const exp = this.decodificarToken()['exp'];
    const now = Date.now().valueOf() / 1000;
    return now < exp;
  }
}
