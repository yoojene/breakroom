
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController,
  NavParams,
  Slides,
  Navbar,
  Platform,
  ModalController,
  Content,
  IonicPage } from 'ionic-angular';
import {
  DailyDataCapturePage
} from '../../pages/daily-data-capture/daily-data-capture';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment';
import { UserStore } from '../../stores/user.store';
import {
  UserInterfaceUtilsProvider
} from '../../providers/utils/user-interface-utils';
import { AuthProvider } from '../../providers/auth/auth';
import { Logger } from '@pharma/pharma-component-utils';
import {
  AchievementsProvider
} from '../../providers/achievements/achievements';
import { BreakroomConfig } from '../../app/app.config';
import {
  PersonaliseCompletePage
} from '../personalise-complete/personalise-complete';
import { AchievementEventMap } from '../../models/achievement.model';
import {
  QuitMethodModalComponent
} from '../create-account-profile/quit-method-modal/quit-method-modal';
import {
  AnalyticsProvider,
  analyticsValues } from '../../providers/analytics/analytics';
import {
  DashboardLogicProvider
} from '../../providers/dashboard/dashboard-logic';
import { pharmaPerson } from '../../models/user.model';
import OverlayScrollbars from "overlayscrollbars";

// tslint:disable:no-magic-numbers
declare var cordova;
declare var window;
@IonicPage()
@Component({
  selector: 'page-personalise',
  templateUrl: 'personalise.html',
})
export class PersonalisePage {
  // tslint:disable-next-line:member-access
  @ViewChild(Slides)
  public slides: Slides;
  // tslint:disable-next-line:member-access
  @ViewChild(Navbar)
  // we override the back button we can press back button on nav bar
  // to go back a previous slide
  public navBar: Navbar;

  @ViewChild(Content) public content: Content;

  public currentSlideIndex: number;

  // slide 1
  public pricePerPacket;
  public numberCigarettesSmoked;
  public cigarettesInPacket;
  public reviewMessage = this.translate.instant('GENERIC_MESSAGES.REVIEW');

  // screen 2
  public reasonQuitting;
  public reasonQuittingTitle = this.translate.instant(
    'PERSONALISE.REASON_QUIT_TITLE'
  );

  public reasonQuittingError = false;
  // screen 3
  public numberYearsSmoked;
  public numberAttemptedQuits;
  // screen 4
  public isTakenChampixBefore = null;
  public previousQuitMethod = null;

  private keybaordShowSub: Subscription;
  private keyboardHideSub: Subscription;
  public registeredPerson: any;
  public relativeDiffYears: number;
  public isTakenChampixBeforeError = false;
  public previousQuitMethodError = false;
  public ionIconHeader = 'round-slide-icon-one';
  public quitMethods = this.config.quitMethods;

  // screen 1 error
  public invalidAvgCigarettesErrorText = this.translate.instant(
    'ERROR_MSG.D2_INVALID_CIGARETTES'
  );
  public aveCigsSmokedErrorText = this.translate.instant(
    'ERROR_MSG.D2_AVE_CIGS_SMOKED'
  );
  public pricePerPacketErrorText = this.translate.instant(
    'ERROR_MSG.D2_PRICE_PER_PACKET_100'
  );
  public invalidPricePerPacketErrorText = this.translate.instant(
    'ERROR_MSG.D2_INVALID_PRICE_PER_PACKET'
  );
  public numInPacketErrorText = this.translate.instant(
    'ERROR_MSG.D2_INVALID_NUMBER_IN_PACKET'
  );
  public invalidNumInPacketErrorText = this.translate.instant(
    'ERROR_MSG.D2_NUMBER_IN_PACKET_50'
  );

  // screen 2 error
  public reasonQuittingErrorText = this.translate.instant(
    'ERROR_MSG.D3_INVALID_QUITTING_REASON'
  );

  // screen 3 error
  public invalidSmokingYearserrorText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS'
  );
  public invalidSmokingYearsBlankText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS_BLANK'
  );
  public invalidSmokingYearsLimitText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS_100'
  );
  public invalidSmokingYearsAgeLimitText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_SMOKING_YEARS_AGE'
  );
  public invalidQuitAttemptErrorText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_QUIT_ATTEMPTS'
  );
  public invalidQuitAttemptLimitErrorText = this.translate.instant(
    'ERROR_MSG.D4_INVALID_QUIT_ATTEMPTS_100'
  );

  // screen 4 error
  public isTakenChampixBeforeErrorText = this.translate.instant(
    'ERROR_MSG.D5_INVALID_CHAPMIX_BEFORE_TAKEN'
  );
  public previousQuitMethodErrorText = this.translate.instant(
    'ERROR_MSG.D5_INVALID_PREVIOUS_QUIT_METHOD'
  );

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private uiUtils: UserInterfaceUtilsProvider,
    public auth: AuthProvider,
    public userStore: UserStore,
    public dashboardLogic: DashboardLogicProvider,
    public achieveProvider: AchievementsProvider,
    public config: BreakroomConfig,
    public logger: Logger,
    private plt: Platform,
    public modalCtrl: ModalController,
    public analyticsService: AnalyticsProvider
  ) {}

  // Lifecycle

  public ionViewWillLeave() {
    if (typeof cordova !== 'undefined') {
      this.removeKeyboardListeners();
    }
  }

  public ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public ionViewWillEnter() {
    this.analyticsService.trackStateAction({
      pagename: analyticsValues.PAGE_PERSONALISE_COMPLETE,
    });

    this.addKeyboardListeners();
    this.currentSlideIndex = this.slides.getActiveIndex();
    this.registeredPerson = this.navParams.get('registeredPerson');

    if (this.registeredPerson) {
      this.relativeDiffYears = moment().diff(
        this.registeredPerson.attributes['dateOfBirth'],
        'years'
      );
    }
    this.setBulletStyle();
  }

  public ionViewDidLoad() {
    // we override the back button we can press back button on nav bar
    // to go back a previous slide
    this.navBar.backButtonClick = (e: UIEvent) => {
      // todo something
      if (this.slides.getActiveIndex() === 0) {
        this.navCtrl.pop();
      } else {
        this.currentSlideIndex = this.slides.getActiveIndex() - 1;
        this.slides.slideTo(this.currentSlideIndex, 500);
      }
    };
  }

  // Private

  private addKeyboardListeners() {
    if (typeof cordova !== 'undefined') {
      window.Keyboard.hideFormAccessoryBar(null, currentValue => {
        this.logger.log('current keyboard toolbar status', currentValue);
      });
      window.Keyboard.hideFormAccessoryBar(false);

      this.keybaordShowSub = Observable.fromEvent(
        window,
        'keyboardWillShow'
      ).subscribe(e => {
        document.getElementsByClassName('swiper-pagination')[0]['style'][
          'visibility'
        ] = 'hidden';

        // Code here
      });

      this.keyboardHideSub = Observable.fromEvent(
        window,
        'keyboardWillHide'
      ).subscribe(e => {
        document.getElementsByClassName('swiper-pagination')[0]['style'][
          'visibility'
        ] = 'visible';
        // Code here
      });
    }
  }

  private removeKeyboardListeners() {
  if (typeof cordova !== 'undefined') {
      window.Keyboard.hideFormAccessoryBar(true);
      if (this.keybaordShowSub) this.keybaordShowSub.unsubscribe();
      if (this.keyboardHideSub) this.keyboardHideSub.unsubscribe();
    }
  }

  // Public

  public setBulletStyle() {
    const currentIndex = this.slides.getActiveIndex();
    this.slides._bullets.forEach((element, i) => {
      if (Number(element.dataset.slideIndex) <= currentIndex) {
        element.style.background = '#4bc4ce';
        element.style.opacity = '1';
      } else {
        element.style.background = '#737272';
        element.style.opacity = '0.5';
      }
    });
  }

  public eventHandler($event, type) {
    if (this.plt.is('android')) {
      if ($event.key === 'Unidentified' && !$event.target.value) {
        this.removeText(type);
      }
    } else {
      if ($event.key === '.' || !$event.target.value) {
        this.removeText(type);
      }
    }
  }

  public removeText(type) {
    switch (type) {
      case 'numberCigarettesSmoked':
        this.numberCigarettesSmoked = '';
        break;
      case 'pricePerPacket':
        this.pricePerPacket = '';
        break;
      case 'cigarettesInPacket':
        this.cigarettesInPacket = '';
        break;
      case 'numberYearsSmoked':
        this.numberYearsSmoked = '';
        break;
      case 'numberAttemptedQuits':
        this.numberAttemptedQuits = '';
        break;
      default:
      //  this.numberYearsSmoked= '';
    }
  }

  public value = 'none';

  public slideChanged() {
    this.content.scrollToTop();
    const currentIndex = this.slides.getActiveIndex();

    this.setBulletStyle();

    switch (currentIndex) {
      case 0:
        this.ionIconHeader = 'round-slide-icon-one';
      break;
      case 1:
        this.ionIconHeader = 'round-slide-icon-two';
      break;
      case 2:
        this.ionIconHeader = 'round-slide-icon-three';
      break;
      default:
        this.ionIconHeader = 'round-slide-icon-four';
    }

  }




  public onQuitReasonTouched() {

    const timeout = 100;
    setTimeout(() => {
      const osClass = document.getElementsByClassName('alert-radio-group')[0];

      const os = OverlayScrollbars(osClass, {
        className: 'os-theme-dark',
        resize: 'none',
        sizeAutoCapable: true,
        paddingAbsolute: true,
        scrollbars: {
          clickScrolling: true,
        },
        nativeScrollbarsOverlaid: {
          showNativeScrollbars: false,
          initialize: true,
        },
      });
    }, timeout);
  }


  public async skip() {
    // Update UserStore.profileComplete to false
    try {
      this.uiUtils.showLoading();

      const person: pharmaPerson = {
        id: this.userStore.user.id,
        firstName: this.userStore.user.firstName,
        lastName: this.userStore.user.lastName,
      };

      const personUpdates = {
        onboardingComplete: true,
        profileComplete: false,
        numberCigarettesSmoked: this.numberCigarettesSmoked,
        pricePerPacket: this.pricePerPacket,
        cigarettesInPacket: this.cigarettesInPacket,
        reasonQuitting: this.reasonQuitting,
        numberYearsSmoked: this.numberYearsSmoked, // Possibly null if skipped
        numberAttemptedQuits: this.numberAttemptedQuits, // Possibly null
        isTakenChampixBefore: this.isTakenChampixBefore, // Possibly null
        previousQuitMethod: this.previousQuitMethod, // Possibly null
        unlockedProgressAchievements: [], // init unlocked achievement arrays
        unlockedHealthAchievements: [], // init unlocked achievement arrays
        unlockedMoneyAchievements: [], // init unlocked achievement arrays
        unlockedCommunityAchievements: [], // init unlocked achievement arrays
        progressAchievements: '', // init unlocked achievement strings
        healthAchievements: '', // init unlocked achievement strings
        moneyAchievements: '', // init unlocked achievement strings
        communityAchievements: '', // init unlocked achievement strings
        likesHighFivesReceived: 0,
        likesHighFivesMade: 0,
        latestUnlockedAchievement: {}, // init latest unlocked

        locale: this.translate.getDefaultLang(),
      };

      await this.auth.updatepharmaPerson(person, personUpdates);

      this.userStore.updateUser(personUpdates);

      this.analyticsService.trackAction({
        pagename: `${analyticsValues.PAGE_PERSONALISE_COMPLETE}`,
        linkname: `Incomplete complete |${this.userStore.user.username}`,
      });

      this.uiUtils.hideLoading();

      if (this.dashboardLogic.isPostQuit()) {
        this.navCtrl.setRoot('TabsPage');
      } else {
        this.navCtrl.push(DailyDataCapturePage, { fromDashBoard: false });
      }
    } catch (err) {
      this.logger.error(err);
      this.uiUtils.hideLoading();
    }
  }

  public async done() {
    // All fields completed, set UserStore.profileComplete to true
    try {
      this.uiUtils.showLoading();

      const firstStep = this.config.myProgressAchievements.filter(ach => {
        return ach.name === 'firstStep';
      });

      const person: pharmaPerson = {
        id: this.userStore.user.id,
        firstName: this.userStore.user.firstName,
        lastName: this.userStore.user.lastName,
        email: this.userStore.user.email,
      };

      const achieveEvent = await this.achieveProvider.addAchievementEvent(
        firstStep[0]
      );

      // Update latestUnlockedAchievement with eventId,janrainId and unlocked
      // date
      firstStep[0].eventId = achieveEvent.id;
      firstStep[0].janrainId = achieveEvent.janrainId;
      firstStep[0].unlocked = true;
      firstStep[0].unlockedDate = moment().format('YYYY-MM-DD');

      const personUpdates = {
        onboardingComplete: true,
        profileComplete: true,
        numberCigarettesSmoked: this.numberCigarettesSmoked,
        pricePerPacket: this.pricePerPacket,
        cigarettesInPacket: this.cigarettesInPacket,
        reasonQuitting: this.reasonQuitting,
        numberYearsSmoked: this.numberYearsSmoked,
        numberAttemptedQuits: this.numberAttemptedQuits,
        isTakenChampixBefore: this.isTakenChampixBefore,
        previousQuitMethod: this.previousQuitMethod,
        unlockedProgressAchievements: [
          {
            name: firstStep[0].name,
            eventId: achieveEvent.id,
            janrainId: achieveEvent.janrainId,
            deepLinkId: firstStep[0].deepLinkId,
            celebrated: false,
          },
        ] as AchievementEventMap[],
        progressAchievements: firstStep[0].name,
        unlockedHealthAchievements: [], // init unlocked achievement arrays
        unlockedMoneyAchievements: [], // init unlocked achievement arrays
        unlockedCommunityAchievements: [], // init unlocked achievement arrays
        healthAchievements: '', // init unlocked achievement strings
        moneyAchievements: '', // init unlocked achievement strings
        communityAchievements: '', // init unlocked achievement strings
        likesHighFivesReceived: 0,
        likesHighFivesMade: 0,
        latestUnlockedAchievement: firstStep[0],
        locale: this.translate.getDefaultLang(),
      };

      await this.auth.updatepharmaPerson(person, personUpdates);

      this.userStore.updateUser(personUpdates);

      this.analyticsService.trackAction({
        pagename: `${analyticsValues.PAGE_PERSONALISE_COMPLETE}`,
        linkname: `Profiles complete |${this.userStore.user.username}`,
      });

      this.uiUtils.hideLoading();
      this.navCtrl.push(PersonaliseCompletePage, { achievement: firstStep[0] });
    } catch (err) {
      this.logger.error(err);
      this.uiUtils.hideLoading();
    }
  }

  public willEnterScreen2(): boolean {
    if (
      this.pricePerPacket > 100 ||
      this.pricePerPacket !== Math.floor(this.pricePerPacket)
    ) {
      return true;
    }
    if (
      this.cigarettesInPacket > 50 ||
      this.cigarettesInPacket !== Math.floor(this.cigarettesInPacket)
    ) {
      return true;
    }
    if (!this.cigarettesInPacket || !this.pricePerPacket) {
      return true;
    }
    if (
      this.numberCigarettesSmoked !== Math.floor(this.numberCigarettesSmoked)
    ) {
      return true;
    }

    return false;
  }

  public willEnterScreen3(): boolean {
    if (!this.reasonQuitting) {
      return true;
    }
    this.reasonQuittingError = false;

    return false;
  }

  public checkNumberYearsSmokedUndefined() {
    if (this.numberYearsSmoked === undefined) {
      this.numberYearsSmoked = null;
    }
  }

  public checkNumberAttemptedQuitsUndefined() {
    if (this.numberAttemptedQuits === undefined) {
      this.numberAttemptedQuits = null;
    }
  }
  public willEnterScreen4(): boolean {
    if (this.numberYearsSmoked > 100) {
      return true;
    }
    if (this.numberYearsSmoked > this.relativeDiffYears) {
      return true;
    }
    if (
      this.numberAttemptedQuits > 100 ||
      this.numberAttemptedQuits % 1 !== 0
    ) {
      return true;
    }

    if (!this.numberYearsSmoked || this.numberAttemptedQuits === null) {
      return true;
    }

    return false;
  }

  public quitResonCancel() {
    if (typeof this.reasonQuitting === 'undefined') {
      this.reasonQuittingError = true;
    }
  }

  // TODO: This logic is a bit unclear maybe in the following 3 functions
  public isTakenChampixBeforeCancel() {
    this.isTakenChampixBeforeError = false;
    if (this.isTakenChampixBefore === null) {
      this.isTakenChampixBeforeError = true;
    }
  }

  public previousQuitMethodCancel() {
    this.previousQuitMethodError = false;
    if (this.previousQuitMethod === null) {
      this.previousQuitMethodError = true;
    }
  }

  public willFinishPersonalise() {
    if (this.isTakenChampixBefore === 'true') {
      if (!this.previousQuitMethod) {
        return true;
      }
    }

    if (!this.isTakenChampixBefore) {
      return true;
    }
    this.isTakenChampixBeforeError = false;
    this.previousQuitMethodError = false;

    return false;
  }

  public goSecondScreen() {
    this.currentSlideIndex++;

    this.slides.slideTo(1, 500);
  }

  public goThirdScreen() {
    this.currentSlideIndex++;

    this.slides.slideTo(2, 500);
  }

  public goFourthScreen() {
    this.currentSlideIndex++;
    this.slides.slideTo(3, 500);
  }

  public willCompletePersonalise(): boolean {
    if (this.isTakenChampixBefore !== null) {
      return false;
    }
    if (this.numberAttemptedQuits !== null) {
      return false;
    }

    return true;
  }

  public onChangeTakenChampixBefore() {
    if (this.isTakenChampixBefore === 'false') {
      this.previousQuitMethod = null;
    }
  }

  public onOpen() {
    setTimeout(() => {
      this.quitResonCancel();
    }, 500);
  }

  public onProjectedLifeSavingsTap() {
    const projectModal = this.modalCtrl.create(
      QuitMethodModalComponent,
      {},
      { cssClass: 'settings-modal' }
    );
    projectModal.present();
  }
}
