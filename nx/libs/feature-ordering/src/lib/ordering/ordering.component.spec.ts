import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderingComponent } from './ordering.component';

describe('OrderingComponent', () => {
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
    const fixture = TestBed.createComponent(OrderingComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize with no selected dish', () => {
    const fixture = TestBed.createComponent(OrderingComponent);
    const component = fixture.componentInstance;
    expect(component.selectedDish()).toBeNull();
    expect(component.orderSubmitted()).toBe(false);
  });

  it('canNavigateAway should return true when mustOrder is false', () => {
    const fixture = TestBed.createComponent(OrderingComponent);
    const component = fixture.componentInstance;
    component.mustOrder.set(false);
    expect(component.canNavigateAway()).toBe(true);
  });

  it('canNavigateAway should return false when mustOrder is true and order not submitted', () => {
    const fixture = TestBed.createComponent(OrderingComponent);
    const component = fixture.componentInstance;
    component.mustOrder.set(true);
    component.orderSubmitted.set(false);
    expect(component.canNavigateAway()).toBe(false);
  });

  it('canNavigateAway should return true when mustOrder is true and order submitted', () => {
    const fixture = TestBed.createComponent(OrderingComponent);
    const component = fixture.componentInstance;
    component.mustOrder.set(true);
    component.orderSubmitted.set(true);
    expect(component.canNavigateAway()).toBe(true);
  });
});
