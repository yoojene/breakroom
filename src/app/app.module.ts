import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { NgCircleProgressModule } from 'ng-circle-progress';
import {
  JANRAIN_CONFIG,
  pharma_CONFIG,
  pharma_HTTP_CLIENT,
  pharmaProvider
} from '@pharma/pharma-js-bindings-ng';
import { Logger, AdobeAnalyticsWrapperService } from '@pharma/pharma-component-utils';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BreakroomApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { ContentPageModule } from '../pages/content/content.module';
import { MobxAngularModule } from 'mobx-angular';
import { ComponentsModule } from '../components/components.module';
import { LandingPageModule } from '../pages/landing/landing.module';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { SplashPageModule } from '../pages/splash/splash.module';
import { SplashPage } from '../pages/splash/splash';
import { PersonalisePage } from '../pages/personalise/personalise';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PersonaliseEntryPage
} from '../pages/personalise-entry/personalise-entry';
import { PostcodeProvider } from '../providers/postcode/postcode';
import { ActivationProvider } from '../providers/activation/activation';
import { AssetService } from '@pharma/pharma-js-sdk';
import { BreakroomConfig } from './app.config';
import { HTTP } from '@ionic-native/http';

import { IonicStorageModule } from '../../node_modules/@ionic/storage';
import { UtilsProvider } from '../providers/utils/utils';
import { TermsConditionsPage
} from '../pages/terms-conditions/terms-conditions';
import { PrivacyPolicyPage
} from '../pages/privacy-policy/privacy-policy';
import { AboutPage } from '../pages/about/about';
import { NotificationsSettingsPage
} from '../pages/notifications-settings/notifications-settings';
import { AuthProvider } from '../providers/auth/auth';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { Keyboard } from '@ionic-native/keyboard';

import {pharmaAxiosHttpClient} from '@pharma/pharma-js-http-client-axios';
import { ContentProvider } from '../providers/content/content';
import { UserProvider } from '../providers/user/user';
import { UserStore } from '../stores/user.store';
import { UserInterfaceUtilsProvider
} from '../providers/utils/user-interface-utils';
import { NotificationProvider
} from '../providers/notification/notification.provider';
import {
  DashboardChartsProvider
 } from '../providers/dashboard/dashboard-charts';
import { Deeplinks } from '@ionic-native/deeplinks';
import { AchievementsProvider } from '../providers/achievements/achievements';
import { DashboardLogicProvider } from '../providers/dashboard/dashboard-logic';
import { PersonaliseCompletePage
} from '../pages/personalise-complete/personalise-complete';
import { PersonaliseCompletePageModule
} from '../pages/personalise-complete/personalise-complete.module';
import { DailyCaptureProvider } from '../providers/daily-capture/daily-capture';
import { CommunityProvider } from '../providers/community/community';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AnalyticsProvider } from '../providers/analytics/analytics';
import { ReactionProvider } from '../providers/reaction/reaction';
import { NotificationStore } from '../stores/notification.store';
import { ContentDetailPageModule } from '../pages/content-detail/content-detail.module';
import { Diagnostic } from '@ionic-native/diagnostic';
import { IonicImageLoader } from 'ionic-image-loader';
import { DailyDataCaptureModule } from '../pages/daily-data-capture/daily-data-capture.module';
import { EditProfilePageModule } from '../pages/edit-profile/edit-profile.module';
import { DailyDataCaptureCigarettesModule } from '../pages/daily-data-capture-cigarettes/daily-data-capture-cigarettes.module';
import { EditProfileChampixPageModule } from '../pages/edit-profile-champix/edit-profile-champix.module';
import { Network } from '@ionic-native/network';
import { NetworkProvider } from '../providers/network/network.provider';
import { PersonalisePageModule } from '../pages/personalise/personalise.module';
import { AppVersion } from '@ionic-native/app-version';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function createAxiosClient() {
  return new pharmaAxiosHttpClient();
}

@NgModule({
  declarations: [
    BreakroomApp,
    LoginPage,

    NotificationsSettingsPage,
    PrivacyPolicyPage,
    AboutPage,
    ResetPasswordPage,
    TermsConditionsPage,
    PersonaliseEntryPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(BreakroomApp, {
      iconMode: 'ios',
      mode: 'ios',
      tabsHideOnSubPages: true,
    }),
    IonicImageLoader.forRoot(),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    MobxAngularModule,
    PersonalisePageModule,
    ContentPageModule,
    ContentDetailPageModule,
    ComponentsModule,
    TabsPageModule,
    LandingPageModule,
    SplashPageModule,
    PersonaliseCompletePageModule,
    DailyDataCaptureModule,
    DailyDataCaptureCigarettesModule,
    EditProfilePageModule,
    EditProfileChampixPageModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300,
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    BreakroomApp,
    LoginPage,
    PersonalisePage,
    PersonaliseCompletePage,
    PersonaliseEntryPage,
    NotificationsSettingsPage,
    ResetPasswordPage,
    TermsConditionsPage,
    PrivacyPolicyPage,
    AboutPage,
    SplashPage,
  ],
  providers: [
    UserProvider,
    UserStore,
    NotificationStore,
    AppVersion,
    Logger,
    StatusBar,
    Keyboard,
    SplashScreen,
    pharmaProvider,
    InAppBrowser,
    Deeplinks,
    UserInterfaceUtilsProvider,
    AdobeAnalyticsWrapperService,
    AssetService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    {
      provide: pharma_HTTP_CLIENT,
      useFactory: createAxiosClient,
    },
    {
      provide: JANRAIN_CONFIG,
      useValue: {
        // Janrain flow name, needed to determine the registration form.
        // Default is 'standard'
        flowName: 'standard',
        version: '20160803203608538402',
        // Name of the registraion form - Depends on the Janrain Form,
        // Default is usually okay
        registerForm: null, // Use the default
        // Sign in form name over at Janrain -
        // Depends on the Janrain Form, Default is usually okay
        signInForm: null,
        // Name of the Change password form -
        // Depends on the Janrain Form, Default is usually okay
        changePasswordForm: null,
        // The name of the email field - Get this from Janrain Configuration
        emailFieldName: 'signInEmailAddress',
        // The name of the password field - get this from Janrain Configuration
        passwordFieldName: 'currentPassword',
        // Janrain Client ID - Provided by pharma Admistrators.
        // This is a dev token, it will work for playing around.
        clientId: 'yr978gj4qfmzn6y466czpzx6k9uj76qw',
        // Locale for Janrain Client. Defaults to 'en-US' but for some projects
        // it may be a different locale string
        locale: null,
        // Additional headers to send with the Janrain Request.
        // The example shown is unnecessary.
        headers: {
          // 'X-INSTANCE-ID': '732bceb3-e33f-4b00-96dc-6539f23e7e43'
        },
        // Which Janrain Environment to connect to -
        // This is required only if `useAlchemist: true`
        janrainEnv: 'dev',
        // What kind of response do you want to get back from the Janrain
        // endpoint? See the Refresh Token page for more information.
        responseType: 'token',
      },
    },
    {
      provide: pharma_CONFIG,
      useValue: {
        baseUrl: 'https://pharma-nxt-test.ir-e1.cloudhub.io/api/v2',
        useAlchemist: false,
        version: 2,
        instanceId: 'breakroom_instance',
        oAuth: {
          oAuthClient: 'd831fe51-24b9-4815-88af-e86b44f93c46',
          oAuthSecret: 'gG6bakXSSN4L3X85TckIo7Jjl1vC9NM4YnReQ9X0',
        },
      },
    },
    PostcodeProvider,
    ActivationProvider,
    BreakroomConfig,
    HTTP,
    UtilsProvider,
    AuthProvider,
    ContentProvider,
    UserProvider,
    UserInterfaceUtilsProvider,
    NotificationProvider,
    AchievementsProvider,
    DailyCaptureProvider,
    DashboardChartsProvider,
    DashboardLogicProvider,
    CommunityProvider,
    AnalyticsProvider,
    ReactionProvider,
    NetworkProvider,
    Network,
    Diagnostic,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
