import { Injectable } from '@angular/core';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { PersonService, IpharmaRequest, pharmaRequestMethod } from '@pharma/pharma-js-sdk';

@Injectable()
export class UserProvider {
  constructor(public pharmaProvider: pharmaProvider) {
  }

  public async getProfile(id: any): Promise<any> {
    const person: PersonService = this.pharmaProvider.pharmaService.service(
      'person'
    ) as PersonService;
    try {
      return await person.getOne(id);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * To populate UserStore with
   *
   */
  public async getAllProfiles() {

    const param = {};

    const request: IpharmaRequest = {
      method: pharmaRequestMethod.GET,
      endpoint: 'persons',
      params: param,
      headers: null,
      exemptRefresh: false,
    };

    return this.pharmaProvider.pharmaService.callApi(request);
  }

  /**
   *
   * Check /exists API for unique username
   */
  public async checkUsernameExists(username) {
      const param = {
        payloadFilters: `attributes.username=${username}`,
      };

      const request: IpharmaRequest = {
        method: pharmaRequestMethod.GET,
        endpoint: 'persons/exists',
        params: param,
        headers: null,
        exemptRefresh: false,
      };

      return this.pharmaProvider.pharmaService.callApi(request);
    }
}
