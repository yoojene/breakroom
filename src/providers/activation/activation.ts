import { Injectable } from '@angular/core';
import { AssetService, pharmaResult } from '@pharma/pharma-js-sdk';
import {
  pharmaProvider,
} from '@pharma/pharma-js-bindings-ng';
import { BreakroomConfig } from '../../app/app.config';

@Injectable()
export class ActivationProvider {
  constructor(
    public pharmaProvider: pharmaProvider,
    private config: BreakroomConfig
  ) {}

  public async getActivationCodes(): Promise<any> {
    const asset: AssetService = this.pharmaProvider.pharmaService.service(
      'asset'
    ) as AssetService;
    const assetOpts = { type: this.config.activationAssetType };

    return asset
      .get(assetOpts)
      .then(
        (res): pharmaResult => {
          return res;
        }
      );
  }
}
