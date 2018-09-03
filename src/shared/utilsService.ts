import { LoadingController } from 'ionic-angular';
import { Injectable } from '@angular/core';


@Injectable()
export class UtilsService {
      private _loader;

      constructor(public loadingControl: LoadingController) {
      }

      presentLoading(text: string = "loading from device") {
            this._loader = this.loadingControl.create({
                  content: text,
                  duration:5000
                  
            });

            this._loader.onDidDismiss(() => {
                  console.log('Dismissed loading');
            });

            this._loader.present();
      }

      hideLoading() {
            this._loader.dismiss();
      }


}