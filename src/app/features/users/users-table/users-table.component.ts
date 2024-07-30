import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../../core/models/auth/user.model';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css'
})
export class UsersTableComponent implements OnInit {
  @Input() users: User[];
  searchTerm: string = '';
  filteredUsers: User[];
  @Output() dialogClosed = new EventEmitter<void>();
  

  constructor(private dialog:MatDialog) { }

  ngOnInit(): void {
    this.filteredUsers = this.users;
  }

  filterItems() {
    this.filteredUsers = this.users.filter((usuario: any) => {
      return (usuario.names?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
              usuario.firstLastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
              usuario.secondLastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
              usuario.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
              usuario.employeeId?.includes(this.searchTerm.toLowerCase()));
    });
    
  }

  user_info(user: any) {
    const dialogRef = this.dialog.open(UserInfoComponent, {
      data: user,
      disableClose: true,
      width: '80%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogClosed.emit();
    });
  }

}
