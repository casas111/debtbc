import { TestBed, inject } from '@angular/core/testing';

import { ContractLoaderService } from './contract-loader.service';

describe('ContractLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContractLoaderService]
    });
  });

  it('should be created', inject([ContractLoaderService], (service: ContractLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
