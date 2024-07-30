import { Routes, CanActivate } from '@angular/router';

import { MenuComponent } from './layout/menu/menu.component';
import { UserGuard } from './core/guards/user/user.guard';
import { LoginGuard } from './core/guards/login/login.guard';
import { UsersComponent } from './features/users/users.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
    {
        path: '',
        component: MenuComponent,
        canActivate: [UserGuard],

        children: [
            {
                path: 'usuarios',
                component: UsersComponent
            },
            {
                path: '',
                component: HomeComponent
            }
        ],
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
];
