import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDto } from '../../dtos/confirmation.dto';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit {
  confirmationData: ConfirmationDto;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ConfirmationDto,
    public dialogRef: MatDialogRef<ConfirmationComponent>
  ) { 
    this.confirmationData = data
  }


  ngOnInit(): void {
    
  }

  accept() {
    this.confirmationData.accept();
    this.dialogRef.close();

  }

  reject() {
    if (this.confirmationData.reject) {
      this.confirmationData.reject();
    }

    this.dialogRef.close();
  }

}
