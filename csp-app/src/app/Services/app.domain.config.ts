import { Injectable } from '@angular/core';
import{environment} from '../../environments/environment';

@Injectable()
export class DomainConfigService {
  public domain: string = environment.domain_name;
}