import { Injectable } from '@angular/core';
import {
  PersonService,
  IpharmaPersonRecord,
  IpharmaPerson,
  EventService,
  IEvent,
  IpharmaRequest,
  pharmaRequestMethod,
  pharmaResult
} from '@pharma/pharma-js-sdk';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { BreakroomConfig } from '../../app/app.config';
import { Logger } from '@pharma/pharma-component-utils';
import { UserStore } from '../../stores/user.store';
import { NotificationStore } from '../../stores/notification.store';
import {
  DailyCaptureProvider
} from '../../providers/daily-capture/daily-capture';

import {  App } from 'ionic-angular';

@Injectable()
export class AuthProvider {
  constructor(
    public pharmaProvider: pharmaProvider,
    private config: BreakroomConfig,
    private userStore: UserStore,
    private logger: Logger,
    private app: App,
    private dailyCaptureProvider: DailyCaptureProvider,
    public notificationStore: NotificationStore
  ) {}

  // Public
  public async hydrateAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Rehydrate Janrain token
      this.pharmaProvider.pharmaService.auth
        .hydrate()
        .then(response => {
          this.userStore.setUpStore().then(res => {
            resolve();
          });
        })
        .catch((error: any) => {
          this.logger.log(error);
          resolve();
        });
    });
  }

  /**
   * Check if user still have access
   */
  public async checkUserHasAccess(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.logger.log('calling checkUserHasAccess');
       const params = {};

       const request: IpharmaRequest = {
         method: pharmaRequestMethod.GET,
         endpoint: `person/${this.userStore.user.id}`,
         params: params,
         headers: null,
         exemptRefresh: false,
       };
      this.pharmaProvider.pharmaService
        .callApi(request)
        .then((response: pharmaResult) => {
          this.logger.log('calling checkUserHasAccess');
          console.log(response);
          resolve(true);
        })
        .catch((error: any) => {
          this.cleanUserAuthStoragement();
          resolve(false);
        });
    });
  }

  /**
   * Remove invalid user due experion error
   */
  public cleanUserAuthStoragement() {
    const authUser = {
      accessToken: null,
      authorizationCode: null,
      expiresAt: null,
      person: null,
      refreshToken: null,
    };
    this.pharmaProvider.authService.user = authUser;
  }

  /**
   * Logout and redirect to LandingPage
   */
  public doLogOut(logoutMessage = false) {
    this.logout();
    this.userStore.updateUser({ authenticated: false });
    this.notificationStore.clearStore();
    this.dailyCaptureProvider.cleanLogOut();
    // this.notificationsProvider.unRegisterNotifications();
    /* TODO: UNREGISTER DEEPLINKS */
    this.cleanUserAuthStoragement();
    this.userStore.resetUser();
    this.app
      .getRootNav()
      .setRoot('LandingPage', { showLogoutMessage: logoutMessage });
  }

  /**
   * Registers Janrain account and creatse Person record in pharma
   */
  public async registerAccount(
    email: string,
    password: string,
    otherFields: any
  ): Promise<any> {
    const janrainFields = {
      firstName: otherFields.firstName,
      lastName: otherFields.lastName,
    };

    try {
      const registered = await this.pharmaProvider.authService
      .registerUserViaEmail(
        email,
        password,
        janrainFields
      );

      this.logger.log(registered);

      const pharmaPersonRecord: IpharmaPersonRecord = {
        id: registered.janrainId,
        personTypes: [this.config.breakroomPersonType],
        firstName: otherFields.firstName,
        lastName: otherFields.lastName,
        // tslint:disable-next-line:object-literal-shorthand
        email: email,
        isActive: true,
        attributes: {
          dateOfBirth: otherFields.dateOfBirth,
          gender: otherFields.gender,
          postCode: otherFields.postCode,
        },
      };

      return this.createPerson(pharmaPersonRecord);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * Autheticates against Janrain and checks if Janrain ID (Person) is in pharma
   */
  public async authenticateAccount(
    email: string,
    password: string
  ): Promise<IpharmaPerson> {
    try {
      const authenticatedPerson = await this.pharmaProvider.authService
      .loginViaEmail(
        email,
        password
      );

      return this.getPerson(authenticatedPerson);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async logout(): Promise<any> {
    return this.pharmaProvider.authService.logout();
  }

  /**
   * Updates attributes on pharma Person record - used during onboarding
   */
  public async updatepharmaPerson(
    registeredPerson: any,
    attrsToUpdate: any
  ): Promise<any> {
    const personSrv: PersonService = this.pharmaProvider.pharmaService.service(
      'person'
    ) as PersonService;

    // Construct the IpharmaPersonRecord
    let person: IpharmaPersonRecord = {
      id: registeredPerson.id,
      personTypes: [this.config.breakroomPersonType],
      firstName: registeredPerson.firstName,
      lastName: registeredPerson.lastName,
      email: registeredPerson.email,
      isActive: true,
      attributes: {},
    };

    // Append updated attributes
    person = { ...person, attributes: { ...attrsToUpdate } };

    try {
      const personReg: any = await personSrv.update(person);
      this.logger.log(personReg);

      const [results] = personReg.results;

      return results;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * User in EditProfilePage
   */
  public async updatepharmaPersonProfile(profileUpdates: any): Promise<any> {
    const personSrv: PersonService = this.pharmaProvider.pharmaService.service(
      'person'
    ) as PersonService;

    const person: IpharmaPersonRecord = {
      id: profileUpdates.id, // Get from UserStore
      personTypes: profileUpdates.personTypes,
      firstName: profileUpdates.firstName,
      lastName: profileUpdates.lastName,
      email: profileUpdates.email,
      isActive: true,
      attributes: {
        startDate: profileUpdates.startDate,
        quitDate: profileUpdates.quitDate,
        postCode: profileUpdates.postCode,
        dateOfBirth: profileUpdates.dateOfBirth,
        gender: profileUpdates.gender,
        reasonQuitting: profileUpdates.reasonQuitting,
        isTakenChampixBefore: profileUpdates.isTakenChampixBefore,
        numberAttemptedQuits: profileUpdates.numberAttemptedQuits,
        numberYearsSmoked: profileUpdates.numberYearsSmoked,
        previousQuitMethod: profileUpdates.previousQuitMethod,
      },
    };

    try {
      const personReg = await personSrv.update(person);
      this.logger.log(personReg);

      return personReg;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getPersonById(personId: string): Promise<any> {

    const personSrv: PersonService = this.pharmaProvider.pharmaService.service(
       'person'
     ) as PersonService;

    try {
      const personRes: any = await personSrv.get(personId);
      this.logger.log(personRes);

      const [results] = personRes.results;

      return results;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async addRegistrationEvent(): Promise<any> {
    const event = this.pharmaProvider.pharmaService.service(
      'event'
    ) as EventService;

    const achievementEvent: IEvent = {
      eventType: this.config.registrationEventType,
      attributes: {
        champixStartDate: this.userStore.user.startDate,
        journeyType: this.userStore.user.quitMethod,
        quitDate: this.userStore.user.quitDate,
        dateOfBirth: this.userStore.user.dateOfBirth,
        profileComplete: false,
      },
      isActive: true,
      janrainId: this.userStore.user.id,
    };

    try {
      const eventRes = await event.update(
        achievementEvent,
        this.userStore.user.id
      );

      return eventRes;
    } catch (err) {
      this.logger.error(err);
    }
  }

  // Private

  private async createPerson(registered: IpharmaPersonRecord): Promise<any> {
    const person: PersonService = this.pharmaProvider.pharmaService.service(
      'person'
    ) as PersonService;

    try {
      const personReg = await person.create(registered);

      return personReg;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async getPerson(registered: IpharmaPerson): Promise<any> {
    const person: PersonService = this.pharmaProvider.pharmaService.service(
      'person'
    ) as PersonService;
    try {
      return await person.getOne(registered.janrainId);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
