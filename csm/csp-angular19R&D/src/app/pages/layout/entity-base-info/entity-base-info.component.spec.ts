import { provideAnimations } from '@angular/platform-browser/animations';
﻿import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EntityBaseInfoComponent } from './entity-base-info.component';
import { AppsService } from '../../../core/services/apps.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('EntityBaseInfoComponent', () => {
  let component: EntityBaseInfoComponent;
  let fixture: ComponentFixture<EntityBaseInfoComponent>;
  let mockAppService: any;
  let mockDialogRef: any;

  const dialogData = {
    header: 'Risk Details',
    project: 'Test Project',
    entity: { id: 1 },
    entityType: 'RISK'
  };

  beforeEach(waitForAsync(() => {
    mockAppService = {
      getEntityGeneralInfo: jasmine.createSpy().and.returnValue(of({ id: 1, name: 'Test Entity' }))
    };
    mockDialogRef = {
      close: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [EntityBaseInfoComponent],
      providers: [
        { provide: AppsService, useValue: mockAppService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        provideHttpClient(),
        provideAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityBaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set header and project from dialog data on init', () => {
    expect(component.header).toBe('Risk Details');
    expect(component.project).toBe('Test Project');
  });

  it('should call getEntityGeneralInfo on init', () => {
    expect(mockAppService.getEntityGeneralInfo).toHaveBeenCalledWith(dialogData.entity, dialogData.entityType);
  });

  it('should set response after successful data fetch', () => {
    const mockResponse = { id: 1, name: 'Test Entity' };
    mockAppService.getEntityGeneralInfo.and.returnValue(of(mockResponse));
    component.getEntityGeneralInfo();
    expect(component.response).toEqual(mockResponse);
    expect(component.loading).toBe(false);
  });

  it('should set loading to false on error', () => {
    mockAppService.getEntityGeneralInfo.and.returnValue(throwError(() => new Error('error')));
    component.getEntityGeneralInfo();
    expect(component.loading).toBe(false);
  });

  it('should close dialog when closeInfo is called', () => {
    component.closeInfo();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
