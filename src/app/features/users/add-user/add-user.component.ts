import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AnimationsService } from '../../../core/services/animations/animations.service';
import { RegisterDto } from '../../../core/services/auth/dtos/register.dto';
import { Permission } from '../../../core/models/auth/permission.model';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, MultiSelectModule, ConfirmPopupModule, ButtonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit {
  constructor(
    private auth:AuthService, 
    private animations:AnimationsService, 
    private dialog:MatDialogRef<AddUserComponent>,
    private confirmation:ConfirmationService,
  ) { }
  loading: boolean = true;
  permissions: Permission[] = [];
  password: string = '';

  ngOnInit(): void {
    this.get_permissions();

  }

  confirmCancel(event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de cancelar la operación?',
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-times mr-1',
      key: 'popup',
      acceptLabel: 'Cancelar operación',
      rejectLabel: 'Continuar operación',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptButtonStyleClass: 'p-button-sm',
      accept: () => {
        this.dialog.close();
      },
      reject: () => {
          // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }
    });

    console.log('cancel');
  }

  confirmSave(event: Event) {
    console.log(this.addUserForm.value);
    if(this.addUserForm.invalid) {
      this.animations.presentToast('error', 'Por favor, llene todos los campos correctamente');
      this.addUserForm.markAllAsTouched();
      return;
    }
    if(this.addUserForm.value.password != this.password) {
      this.animations.presentToast('error', 'Las contraseñas no coinciden');
      this.addUserForm.get('password').setErrors({incorrect: true});
      return;
    }
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de agregar este usuario?',
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-check mr-1',
      rejectIcon: 'pi pi-times mr-1',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      key: 'popup',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptButtonStyleClass: 'p-button-sm',
      accept: () => {
        // console.log(this.addUserForm.value);
        const registerDto: RegisterDto = new RegisterDto();
        registerDto.names = this.addUserForm.value['nombre'];
        registerDto.firstLastName = this.addUserForm.value['apellidoPaterno'];
        registerDto.secondLastName = this.addUserForm.value['apellidoMaterno'];
        registerDto.employeeId = this.addUserForm.value['numeroEmpleado'];
        registerDto.password = this.addUserForm.value['password'];
        registerDto.permissions = this.addUserForm.value['permissions'];
        this.loading = true;
        this.addUser(registerDto);
      },
      reject: () => {
        
      }
    });

    console.log('save');
  }

  addUser(registerDto: RegisterDto) {
    this.auth.agregarUsuario(registerDto).subscribe({
      next: (response) => {
        this.animations.presentToast('success', 'Usuario agregado correctamente');
        this.dialog.close();
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.animations.presentToast('error', 'Error al agregar el usuario');
      },
      complete: () => {
        console.log('complete');
        this.loading = false;
      }
    })
  }

  async get_permissions() {
    try {
      this.permissions = await this.auth.obtenerPermisos();
    }
    catch (error) {
      console.error(error);
      this.loading = false;
      this.animations.presentToast('error', 'Error al obtener los permisos');
    }
    finally {
      this.loading = false;
    }
    // this.auth.obtenerPermisos().subscribe({
    //   next: (permissions) => {
    //     this.permissions = permissions;
    //     console.log(this.permissions);
    //   },
    //   error: (error) => {
    //     console.error(error);
    //     this.loading = false;
    //     this.animations.presentToast('error', 'Error al obtener los permisos');
    //   },
    //   complete: () => {
    //     console.log('complete');
    //     this.loading = false;
    //   }
    // });
  }

  addUserForm = new FormGroup({
    nombre: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    apellidoPaterno: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    apellidoMaterno: new FormControl(null),
    password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
    numeroEmpleado: new FormControl(null),
    permissions: new FormControl(null),
    estatus: new FormControl(true),
  });

  validate_password() {

  }
}
