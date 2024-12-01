import { ProcessModelModule } from './process-model.module';

describe('ProcessModelModule', () => {
  let processModelModule: ProcessModelModule;

  beforeEach(() => {
    processModelModule = new ProcessModelModule();
  });

  it('should create an instance', () => {
    expect(processModelModule).toBeTruthy();
  });
});
