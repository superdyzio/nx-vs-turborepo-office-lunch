import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserManagementComponent } from './user-management.component';

describe('UserManagementComponent', () => {
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
    const fixture = TestBed.createComponent(UserManagementComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('addUser should set error when username is empty', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const component = fixture.componentInstance;
    component.newUsername.set('');
    component.addUser();
    expect(component.addError()).toBe('Username is required.');
  });

  it('getBadgeColor should return red for disabled user', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const component = fixture.componentInstance;
    const user = { id: '1', username: 'test', isAdmin: false, isDisabled: true, password: '' };
    expect(component.getBadgeColor(user)).toBe('red');
  });

  it('getBadgeColor should return gray for admin user', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const component = fixture.componentInstance;
    const user = { id: '1', username: 'test', isAdmin: true, isDisabled: false, password: '' };
    expect(component.getBadgeColor(user)).toBe('gray');
  });

  it('getBadgeColor should return green for active non-admin user', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const component = fixture.componentInstance;
    const user = { id: '1', username: 'test', isAdmin: false, isDisabled: false, password: '' };
    expect(component.getBadgeColor(user)).toBe('green');
  });
});
