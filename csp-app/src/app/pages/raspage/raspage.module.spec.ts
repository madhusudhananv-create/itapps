import { RASPageModule } from './raspage.module';

describe('RASPageModule', () => {
  let rASPageModule: RASPageModule;

  beforeEach(() => {
    rASPageModule = new RASPageModule();
  });

  it('should create an instance', () => {
    expect(rASPageModule).toBeTruthy();
  });
});
