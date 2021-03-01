import { Injectable } from '@angular/core';
import { AlertController, Events, ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '@pharma/pharma-component-utils';

export enum ConnectionStatusEnum {
    Online = 0,
    Offline = 1
}

declare var navigator;

@Injectable()
export class NetworkProvider {

    public previousStatus: number;
    public toast;//

    constructor(public alertCtrl: AlertController,
                public network: Network,
                public toastCtrl: ToastController,
                public translate: TranslateService,
                public logger: Logger,
                public eventCtrl: Events) {
        this.previousStatus = ConnectionStatusEnum.Online;
    }

    public initializeNetworkEvents(): void {
        this.network.onDisconnect().subscribe(() => {
            this.previousStatus = ConnectionStatusEnum.Offline;
            if (this.previousStatus === ConnectionStatusEnum.Online) {
                this.logger.log('it soffline!!!');
                this.eventCtrl.publish('network:offline');
            }
        });
        this.network.onConnect().subscribe(() => {
            this.previousStatus = ConnectionStatusEnum.Online;
            if (this.previousStatus === ConnectionStatusEnum.Offline) {
                this.eventCtrl.publish('network:online');
            }
        });
    }

    public isOffline(): boolean{
        if(this.previousStatus === ConnectionStatusEnum.Offline){
            this.displayNetworkError();

            return true;
        }

        return false;
    }

    public checkNetwork(): void{
        this.logger.log(navigator.connection.type);
    }

    public displayNetworkError(){
        this.toast = this.toastCtrl.create({
            message: this.translate.instant('NETWORK.OFFLINE_MSG'),
            position: 'top',
            dismissOnPageChange: false,
        });
        this.toast.present();
    }

    public hideNetworkError(){
        this.toast.dismiss();
    }

}
