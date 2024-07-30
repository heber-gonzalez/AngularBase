import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlMaster{

  //Local
  //Produccion
  baseURL:string = 'http://localhost:5224/base/';
}
