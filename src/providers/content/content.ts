import { Injectable } from '@angular/core';
import { pharmaProvider } from '@pharma/pharma-js-bindings-ng';
import { BreakroomConfig } from '../../app/app.config';
import { IAsset, AssetService, pharmaResult } from '@pharma/pharma-js-sdk';

@Injectable()
export class ContentProvider {
  constructor(
    public pharmaProvider: pharmaProvider,
    private config: BreakroomConfig
  ) {
    this.getBannedWords();
  }

  public static bannedWords = null;

  public async getAllChampixInfo(): Promise<any> {
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;
    const assetOpts = {
      type: this.config.champixInfoAssetType,
      isActive: true,
    };

    return asset
      .get(assetOpts)
      .then(
        (res): pharmaResult => {
          return res;
        }
      )
      .catch(async err => Promise.reject(err));
  }

  public async getAllContent(): Promise<any> {
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;
    const assetOpts = {
      type: this.config.contentAssetType,
      isActive: true,
      limit: 100,
    };

    return asset
      .get(assetOpts)
      .then(
        (res): pharmaResult => {
          return res;
        }
      )
      .catch(async err=> Promise.reject(err));
  }

  public async getContentById(assetId: string): Promise<any> {
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;

    return asset
      .getOne(assetId)
      .then(
        (res): pharmaResult => {
          return res;
        }
      )
      .catch(async err => Promise.reject(err));
  }

  public async getTermsConditions(): Promise<any> {
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;
    const assetOpts = {
      type: this.config.termsPrivacyAssetType,
      isActive: true,
      payloadFilters: 'attributes.type=terms',
    };

    return asset
      .get(assetOpts)
      .then(
        (res): pharmaResult => {
          return res;
        }
      )
      .catch(async err => Promise.reject(err));
  }

  public async getPrivacyPolicy(): Promise<any> {
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;
    const assetOpts = {
      type: this.config.termsPrivacyAssetType,
      isActive: true,
      payloadFilters: 'attributes.type=privacy',
    };

    return asset
      .get(assetOpts)
      .then(
        (res): pharmaResult => {
          return res;
        }
      )
      .catch(async err => Promise.reject(err));
  }

  public async getBannedWords() {
    if (ContentProvider.bannedWords) {
      return new Promise(resolve => {
        resolve(ContentProvider.bannedWords);
      });
    }
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;
    const assetOpts = {
      type: this.config.bannedWordsAssetType,
      isActive: true,
    };

    return asset
      .get(assetOpts)
      .then(
        (res): pharmaResult => {
          ContentProvider.bannedWords = res;

          return res;
        }
      )
      .catch(async err => Promise.reject(err));
  }
}
