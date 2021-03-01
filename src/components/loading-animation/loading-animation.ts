import { Component, Input } from '@angular/core';
import {Platform} from 'ionic-angular';

// tslint:disable:no-magic-numbers
@Component({
  selector: 'loading-animation',
  templateUrl: 'loading-animation.html'
})
export class LoadingAnimationComponent {

  @Input() public width: number;
  @Input() public height: number;

  public lottieConfig = {
    path: '',
    autoplay: true,
    loop: false};

  private anim: any;

  constructor(public platform: Platform) {
    this.width =  platform.width();
    this.height = platform.height();

  }

  public ngOnInit()  {
    this.width =  this.platform.width();
    this.height = this.platform.height();

    if(this.height >= 300 && this.height < 641){
      this.handle640Height();
    } else if(this.height > 665 && this.height < 737){
      this.handle737Height();
    } else if(this.height > 737 && this.height <= 831){
      this.handle831Height();
    } else if(this.height > 831){
      this.handle896Height();
    }
  }

  private handle640Height(){
    this.lottieConfig.path = 'assets/animations/breakroom_logo-640.json';
    if (this.width >= 360){
      this.lottieConfig.path = 'assets/animations/breakroom_logo-360-640.json';
    }
  }

  private handle737Height(){
    this.lottieConfig.path = 'assets/animations/breakroom_logo-716.json';
    if (this.width >= 375){
      this.lottieConfig.path = 'assets/animations/breakroom_logo-731.json';
    }
  }

  private handle831Height(){
    this.lottieConfig.path = 'assets/animations/breakroom_logo-823.json';
    if(this.width === 360){
      this.lottieConfig.path = 'assets/animations/breakroom_logo-360-740.json';
    }
  }

  private handle896Height(){
    this.lottieConfig.path = 'assets/animations/breakroom_logo-414-896.json';
    if(this.width === 412){
      this.lottieConfig.path = 'assets/animations/breakroom_logo-412-847.json';
    } if(this.width === 480){
      this.lottieConfig.path = 'assets/animations/breakroom_logo-480-853.json';
    }
  }

  public handleAnimation(anim: any) {
    this.anim = anim;
  }

}
