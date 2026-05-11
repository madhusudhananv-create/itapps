import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportsService } from './reports.service';
import { MyUtility } from '../../shared/my-utility';
import { environment } from '../../../environments/environment';

describe('ReportsService', () => {
  let service: ReportsService;
  let httpMock: HttpTestingController;
  let mockMyUtility: jasmine.SpyObj<MyUtility>;

  beforeEach(() => {
    mockMyUtility = jasmine.createSpyObj('MyUtility', ['empid', 'displayname', 'token']);
    mockMyUtility.AppSettings = { token: 'test-token' } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReportsService,
        { provide: MyUtility, useValue: mockMyUtility }
      ]
    });

    service = TestBed.inject(ReportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize API URLs from environment', () => {
    expect(service.apiurl).toBe(environment.webapiuri);
    expect(service.apiurl_auth).toBe(environment.webapiuri_auth);
  });

  describe('GetReport', () => {
    it('should retrieve reports with proper headers', () => {
      const mockReports = [{ id: 1, name: 'Report 1' }, { id: 2, name: 'Report 2' }];
      spyOn(localStorage, 'getItem').and.returnValue('emp123');

      service.GetReport().subscribe(reports => {
        expect(reports).toEqual(mockReports);
      });

      const req = httpMock.expectOne(environment.webapiuri + '/GetReports');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('token')).toBe('test-token');
      expect(req.request.headers.get('empId')).toBe('emp123');
      
      req.flush(mockReports);
    });

    it('should handle missing empId from localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      service.GetReport().subscribe();

      const req = httpMock.expectOne(environment.webapiuri + '/GetReports');
      expect(req.request.headers.get('empId')).toBe('');
      
      req.flush([]);
    });
  });

  describe('Logout', () => {
    it('should logout and clear user data', () => {
      const mockResponse = { success: true };

      service.Logout().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(mockMyUtility.empid).toHaveBeenCalledWith('');
      expect(mockMyUtility.displayname).toHaveBeenCalledWith('');
      expect(mockMyUtility.token).toHaveBeenCalledWith('');

      const req = httpMock.expectOne(environment.webapiuri + '/Logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('token')).toBe('test-token');
      
      req.flush(mockResponse);
    });

    it('should handle logout errors', () => {
      const mockError = { message: 'Logout failed' };

      service.Logout().subscribe({
        error: (error) => {
          expect(error.error).toEqual(mockError);
        }
      });

      const req = httpMock.expectOne(environment.webapiuri + '/Logout');
      req.flush(mockError, { status: 500, statusText: 'Server Error' });
    });
  });
});
