import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform, Config, IonicErrorHandler } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HTTP } from '@ionic-native/http';

import { AppModule } from './app.module';

import { BreakroomApp } from './app.component';
import {
  PlatformMock,
  StatusBarMock,
  SplashScreenMock,
  LoggerMock,
} from '../../test-config/mocks-ionic';
import { UserProvider } from '../providers/user/user';
import { Logger } from '@pharma/pharma-component-utils';
import { UserStore } from '../stores/user.store';
import { pharmaProvider, pharma_HTTP_CLIENT, JANRAIN_CONFIG, pharma_CONFIG } from '@pharma/pharma-js-bindings-ng';
import { AssetService } from '@pharma/pharma-js-sdk';
import { UserInterfaceUtilsProvider } from '../providers/utils/user-interface-utils';
import { PostcodeProvider } from '../providers/postcode/postcode';
import { ActivationProvider } from '../providers/activation/activation';
import { UtilsProvider } from '../providers/utils/utils';
import { AuthProvider } from '../providers/auth/auth';
import { ContentProvider } from '../providers/content/content';
import { ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { pharmaAxiosHttpClient } from '@pharma/pharma-js-http-client-axios';
import { HttpClientModule } from '@angular/common/http';

export function createAxiosClient() {
  return new pharmaAxiosHttpClient();
}
describe('BreakroomApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreakroomApp);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof BreakroomApp).toBe(true);
  });

  // it('should have two pages', () => {
  //   expect(component.pages.length).toBe(2);
  // });

});
