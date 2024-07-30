import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { UrlMaster } from '../url-master.service';
import { Router } from '@angular/router';
import { TokenManagerService } from '../token-manager/token-manager.service';
import { Tokens } from '../../models/auth/token.model';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { User } from '../../models/auth/user.model';
import { Permission } from '../../models/auth/permission.model';
import { EditDto } from './dtos/edit.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
	loggedUser: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(
		private http: HttpClient,
		private urlMaster: UrlMaster,
		private router: Router,
		private tokenManager:TokenManagerService
	) { }
	async initializeApp(): Promise<any> {
		const isAuthenticated = await this.tokenManager.inicializarApp();
		this.isAuthenticated.next(isAuthenticated);
		if(!isAuthenticated){
			this.cerrarSesion();
		}
	}

	public isLoggedIn() : Observable<boolean> {
		return this.isAuthenticated.asObservable();
	}

	async iniciarSesion(loginDto: LoginDto) {
		const tokens:Tokens = await firstValueFrom(this.performLogin(loginDto));
		if(tokens){
			// console.log(tokens);
			this.tokenManager.actualizarTokens(tokens);
			this.isAuthenticated.next(true);
			console.log(this.isAuthenticated.value);
			return tokens;
		}
		return null;
	}

	performLogin(loginDto: LoginDto) :  Observable<Tokens> {
		return this.http.post<Tokens>(`${this.urlMaster.baseURL}auth/user/login`, loginDto);
	}

	async cerrarSesion() {
		this.isAuthenticated.next(false);
		await this.tokenManager.eliminarTokens();
		
	}






	public async puedeConsultar() : Promise<boolean> {
		const grupos = await this.tokenManager.obtenerGrupos();
		if(grupos){
			return grupos.includes('Licencias');
		}
		return false;
	}

	public async puedeImprimir() : Promise<boolean> {
		const grupos = await this.tokenManager.obtenerGrupos();
		if(grupos){
			return grupos.includes('Impresion');
		}
		return false;
	}

	public async puedeConsultarHistorialPenal() : Promise<boolean> {
		const grupos = await this.tokenManager.obtenerGrupos();
		if(grupos){
			return grupos.includes('Interprocesal');
		}
		return false;
	}

	public async puedeAdministrarUsuarios() : Promise<boolean> {
		const grupos = await this.tokenManager.obtenerGrupos();
		if(grupos){
			return grupos.includes('Admin');
		}
		return false;
	}

	public obtenerNombre() {
		return this.tokenManager.obtenerNombre();
	}

	public obtenerID() {
		return this.tokenManager.obtenerID();
	}


	// usuarios
	agregarUsuario(registerDto: RegisterDto) {
		return this.http.post(`${this.urlMaster.baseURL}auth/user/register`, registerDto);
	}

	async obtenerUsuarios() {
		const users: User[] = await firstValueFrom(this.performGetUsers());
		return users;
	}

	private performGetUsers() : Observable<User[]> {
		return this.http.get<User[]>(`${this.urlMaster.baseURL}auth/users`);
	}

	obtenerUsuario(id: any) {
		return this.http.get(`${this.urlMaster.baseURL}auth/user/${id}`);
	}

	async editarUsuario(form: any) {
		await firstValueFrom(this.performEditUser(form));
	}
	
	performEditUser(editDto: EditDto): Observable<any> {
		return this.http.patch(`${this.urlMaster.baseURL}auth/user/edit`, editDto);
	}

	async obtenerPermisos() {
		const permissions: Permission[] = await firstValueFrom(this.performGetPermissions());
		return permissions;
	}

	performGetPermissions() : Observable<Permission[]> {
		return this.http.get<Permission[]>(`${this.urlMaster.baseURL}auth/permissions`);
	}

	cambiarContrasena(form: any) {
		return this.http.put(`${this.urlMaster.baseURL}auth/user/restore_password`, form);
	}

	getLoggedInUser() {
		return this.loggedUser.value;
	}

	// apikeys
	obtenerApiKeys() {
		return this.http.get(`${this.urlMaster.baseURL}auth/apikeys`);
	}

	editarEstatusApiKey(form: any) {
		return this.http.patch(`${this.urlMaster.baseURL}auth/apikey/edit`, form);
	}

	restaurarApiKey(form: any) {
		return this.http.put(`${this.urlMaster.baseURL}auth/apikey/restore`, form);
	}
}
