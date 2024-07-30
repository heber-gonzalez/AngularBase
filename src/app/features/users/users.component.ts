import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

import { AuthService } from '../../core/services/auth/auth.service';
import { UsersTableComponent } from './users-table/users-table.component';
import { AddUserComponent } from './add-user/add-user.component';
import { User } from '../../core/models/auth/user.model';
import { AnimationsService } from '../../core/services/animations/animations.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [UsersTableComponent, CommonModule, LoadingComponent, AddUserComponent, ConfirmDialogModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading: boolean = true;
  constructor(
    private auth:AuthService, 
    private dialog:MatDialog, 
    private confirmation:ConfirmationService,
    private animations: AnimationsService,
  ) { }

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  async dialogClosed(): Promise<void> {
    console.log('dialog closed');
    await this.obtenerUsuarios();
  }

  async obtenerUsuarios() {
    try {
      this.loading = true;
      this.users = await this.auth.obtenerUsuarios();
    }
    catch (error) {
      this.animations.presentToast('error', 'Ocurrió un error al obtener los usuarios', 'Favor de intentar de nuevo');
    }
    finally {
      this.loading = false;
    }
  }


  addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      disableClose: true,
      width: '80%',
    });

    dialogRef.afterClosed().subscribe(async result => {
      await this.obtenerUsuarios();
    });
  }

  // convertir a csv
  convertToCSV(objArray:any) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    
    // Map the array to new objects with desired column names
    array = array.map((obj: any) => ({
      'Nombre': obj.nombre + ' ' + obj.apellidoPaterno + ' ' + (obj.apellidoMaterno || ''),
      'Nombre de usuario': obj.username,
      'Número de empleado': obj.numeroEmpleado ? obj.numeroEmpleado : '',
      'Estatus': obj.estatus ? 'Activo' : 'Inactivo',
      'Fecha de creación':new Date(obj.fechaCreacion).toLocaleDateString(),
      'Permisos': Array.isArray(obj.permissions) ? obj.permissions.map((permission: any) => permission.nombre).join('; ') : '',

    }));
  
    var line = '';
    for (var index in array[0]) {
      if (line != '') line += ','
      line += index;
    }
    str += line + '\r\n';
    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ','
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    str = '\uFEFF' + str;
    return str;
  }

  // descargar csv
  async exportar() {
    this.confirmation.confirm({
      message: '¿Desea exportar los usuarios a un archivo CSV?',
      header: 'Exportar usuarios',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Exportar',
      key: 'dialog',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-arrow-down',
      accept: () => {
        this.exportarCSV();
      },
      reject: () => {
        console.log('cancel');
      }
    });

    
  }

  exportarCSV() {
    var data = this.convertToCSV(this.users);
    var blob = new Blob([data], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    // date to append to the file name
    var date = new Date();
    // file name
    link.download = 'usuarios_' + date.toLocaleDateString() + '.csv';
    link.click();
  }

}
