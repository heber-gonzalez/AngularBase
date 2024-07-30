import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AnimationsService } from '../../../core/services/animations/animations.service';
import { User } from '../../../core/models/auth/user.model';
import { Permission } from '../../../core/models/auth/permission.model';
import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import { ConfirmationDto } from '../../../shared/dtos/confirmation.dto';
import { EditDto } from '../../../core/services/auth/dtos/edit.dto';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, MultiSelectModule, ConfirmPopupModule, ButtonModule],

  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: User, 
    private dialog:MatDialogRef<UserInfoComponent>, 
    private dialogService:MatDialog,
    private confirmation:ConfirmationService,
    private auth:AuthService,
    private animations:AnimationsService,
  ) { }
  user: User;
  editing: boolean = false;
  loading: boolean = true;
  permissions: Permission[];
  

  ngOnInit(): void {
    console.log(this.data);
    this.user = this.data;
    this.editUserForm.disable();
    this.get_permissions();
  }

  async get_permissions() {
    try {
      this.permissions = await this.auth.obtenerPermisos();
    }
    catch (error) {
      console.log(error);
      this.animations.presentToast('error', 'Error al obtener los permisos');
    }
    finally {
      this.patch_form();
    }
  }

  patch_form() {
    try {
      console.log("user",this.user);
      const p = [];
      this.user.permissions.forEach((element: Permission) => {
        console.log(element);
        p.push(element.id);
      });
      this.editUserForm.patchValue({
        id: this.user.id,
        names: this.user.names,
        firstLastName: this.user.firstLastName,
        secondLastName: this.user.secondLastName,
        username: this.user.username,
        employeeId: this.user.employeeId,
        permissions: p,
        status: this.user.status
      });
      this.loading = false;
      console.log(this.editUserForm.value);
    }
    catch (error) {
      console.log(error);
      this.animations.presentToast('error', 'Error al obtener los datos del usuario');
    }
  }

  editUserForm = new FormGroup({
    id: new FormControl(null),
    names: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    firstLastName: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    secondLastName: new FormControl(null),
    username: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    employeeId: new FormControl(null),
    permissions: new FormControl(null),
    status: new FormControl(true),
  });

  confirmCancel(event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de cancelar la operación?',
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-times mr-1',
      key: 'user-info',
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

  changeStatus(event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
  
    if ((this.user.status === true && !checked) || (this.user.status === false && checked)) {
      const message = checked ? 'El usuario podrá iniciar sesión' : 'El usuario no podrá iniciar sesión';
      const confirmation: ConfirmationDto = {
        title: '¿Está seguro de cambiar el estado del usuario?',
        message: message,
        acceptLabel: 'Confirmar',
        rejectLabel: 'Cancelar',
        accept: () => {
          this.editUserForm.patchValue({ status: checked });
        },
        reject: () => {
          setTimeout(() => {
            this.editUserForm.patchValue({
              status: !checked,
            });
          }, 200);
        }
      };
  
      this.dialogService.open(ConfirmationComponent, {
        data: confirmation,
        disableClose: true,
      });
    }
  }
  

  confirmSave(event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de guardar los cambios?',
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-check mr-1',
      key: 'user-info',
      acceptLabel: 'Guardar cambios',
      rejectLabel: 'Cancelar',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptButtonStyleClass: 'p-button-sm',
      accept: () => {
        this.editing = false;
        this.editUserForm.disable();
        console.log(this.editUserForm.value);
        this.save();
      },
      reject: () => {
          // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }
    });
  }

  async save() {
    try {
      this.loading = true;
      const editDto: EditDto = {
        id: this.editUserForm.value.id,
        names: this.editUserForm.value.names,
        firstLastName: this.editUserForm.value.firstLastName,
        secondLastName: this.editUserForm.value.secondLastName,
        username: this.editUserForm.value.username,
        employeeId: this.editUserForm.value.employeeId,
        permissions: this.editUserForm.value.permissions,
        status: this.editUserForm.value.status
      }
      await this.auth.editarUsuario(editDto);

      this.animations.presentToast('success', 'Usuario editado');
      this.dialog.close();
    }
    catch (error) {
      console.log(error);
      this.loading = false;
      this.animations.presentToast('error', 'Error al editar el usuario');
    }
    finally {
      this.loading = false;
    }
  }

  edit() {
    this.editing = true;
    this.editUserForm.enable();
  }

}
