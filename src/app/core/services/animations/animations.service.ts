import { Injectable, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  MatDialog,
} from '@angular/material/dialog';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  private loadingRef:any;
  ref: DynamicDialogRef | undefined;
  constructor(private messageService:MessageService, public dialog:MatDialog, public modal:DialogService) { }

  public presentLoading() {
    // this.loadingRef = this.modalService.open(LoadingComponent, { centered: true, backdrop: 'static', keyboard: false, size: 'sm'});
    this.loadingRef = this.dialog.open(LoadingComponent, { disableClose: true });
    
  }



  public dismissLoading() {
    this.loadingRef.close();
  }

  presentToast(severity:string, summary:string, detail?:string) {
    if(detail) {
      this.messageService.add({severity:severity, summary:summary, detail:detail});
    }
    else {
      this.messageService.add({severity:severity, summary:summary});
    }
  }
}
