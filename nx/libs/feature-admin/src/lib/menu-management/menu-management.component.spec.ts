import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuManagementComponent } from './menu-management.component';

describe('MenuManagementComponent', () => {
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
    const fixture = TestBed.createComponent(MenuManagementComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('addRestaurant should set error when name is empty', () => {
    const fixture = TestBed.createComponent(MenuManagementComponent);
    const component = fixture.componentInstance;
    component.newRestaurantName.set('');
    component.addRestaurant();
    expect(component.addRestaurantError()).toBe('Restaurant name is required.');
  });

  it('formatDish should include price when present', () => {
    const fixture = TestBed.createComponent(MenuManagementComponent);
    const component = fixture.componentInstance;
    const result = component.formatDish({ id: '1', name: 'Pizza', price: 9.99 });
    expect(result).toBe('Pizza — €9.99');
  });

  it('formatDish should return just name when no price', () => {
    const fixture = TestBed.createComponent(MenuManagementComponent);
    const component = fixture.componentInstance;
    const result = component.formatDish({ id: '1', name: 'Pizza' });
    expect(result).toBe('Pizza');
  });
});
