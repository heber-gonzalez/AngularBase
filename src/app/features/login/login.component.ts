import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnimationsService } from '../../core/services/animations/animations.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { LoginDto } from '../../core/services/auth/dtos/login.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  constructor(private animations:AnimationsService, private auth:AuthService, private router: Router,) { }

  ngOnInit(): void {
  }

  public iniciarSesionForm = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  });

  async login() {
    if(this.iniciarSesionForm.invalid) {
      this.animations.presentToast('error', 'Favor de llenar todos los campos');
      this.iniciarSesionForm.markAllAsTouched();
      return;
    }
    this.animations.presentLoading();
    try {
      const loginDto: LoginDto = new LoginDto(this.iniciarSesionForm.value.username, this.iniciarSesionForm.value.password);
      const tokens = await this.auth.iniciarSesion(loginDto);
      if(tokens) {
        console.log(tokens);
        this.animations.dismissLoading();
        this.animations.presentToast('success', 'Bienvenido');
        this.router.navigateByUrl('/', { replaceUrl: true });
      }
    }
    catch(e) {
      this.animations.dismissLoading();
      this.animations.presentToast('error', "Ocurrió un error al iniciar sesión", "Favor de intentar de nuevo.");
    }
  }
}