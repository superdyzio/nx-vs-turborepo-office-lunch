import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DepartureComponent } from './departure.component';

describe('DepartureComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DepartureComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize canLeave as null', () => {
    const fixture = TestBed.createComponent(DepartureComponent);
    const component = fixture.componentInstance;
    expect(component.canLeave()).toBeNull();
  });

  it('should set canLeave to true on onYes', () => {
    const fixture = TestBed.createComponent(DepartureComponent);
    const component = fixture.componentInstance;
    component.onYes();
    expect(component.canLeave()).toBe(true);
  });

  it('should set canLeave to false on onNo', () => {
    const fixture = TestBed.createComponent(DepartureComponent);
    const component = fixture.componentInstance;
    component.onNo();
    expect(component.canLeave()).toBe(false);
  });
});
