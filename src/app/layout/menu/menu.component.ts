import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MatDialog } from '@angular/material/dialog';
import { AnimationsService } from '../../core/services/animations/animations.service';
import { ConfirmationComponent } from '../../shared/components/confirmation/confirmation.component';
import { ConfirmationDto } from '../../shared/dtos/confirmation.dto';
import { AuthService } from '../../core/services/auth/auth.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ConfirmDialogModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  constructor(
    private router:Router, 
    private dialog:MatDialog, 
    private auth:AuthService,
  ) { }

  ngOnInit(): void {

  }

  public inicio() : void {
    this.router.navigate(['']);
  } 

  public usuarios() : void {
    this.router.navigate(['usuarios']);

  }

  public cerrarSesion(event:Event) : void {
    // const dialogRef = this.dialog.open(LogoutComponent, { disableClose: true });
    const confirmation: ConfirmationDto = {
      title: 'Cierre de sesión',
      message: '¿Está seguro de cerrar la sesión?',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.auth.cerrarSesion();
      }
    }
    const dialogRef = this.dialog.open(ConfirmationComponent, { 
      disableClose: true,
      data: confirmation
    });
    
  }

}
