import { TestBed } from '@angular/core/testing';

import { DefaultEnvService } from './default-env.service';

describe('DefaultEnvService', () => {
  let service: DefaultEnvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefaultEnvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
