import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VotingComponent } from './voting.component';

describe('VotingComponent', () => {
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
    const fixture = TestBed.createComponent(VotingComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize with empty picks', () => {
    const fixture = TestBed.createComponent(VotingComponent);
    const component = fixture.componentInstance;
    expect(component.pick3()).toBe('');
    expect(component.pick2()).toBe('');
    expect(component.pick1()).toBe('');
    expect(component.vetoId()).toBe('');
  });

  it('canSubmitVote should return false when picks are incomplete', () => {
    const fixture = TestBed.createComponent(VotingComponent);
    const component = fixture.componentInstance;
    expect(component.canSubmitVote()).toBe(false);
  });

  it('canSubmitVote should return true when 3 distinct picks are set', () => {
    const fixture = TestBed.createComponent(VotingComponent);
    const component = fixture.componentInstance;
    component.pick3.set('r1');
    component.pick2.set('r2');
    component.pick1.set('r3');
    expect(component.canSubmitVote()).toBe(true);
  });

  it('canSubmitVote should return false when picks are not distinct', () => {
    const fixture = TestBed.createComponent(VotingComponent);
    const component = fixture.componentInstance;
    component.pick3.set('r1');
    component.pick2.set('r1');
    component.pick1.set('r3');
    expect(component.canSubmitVote()).toBe(false);
  });

  it('clearVetoIfPicked should clear veto when it matches the given id', () => {
    const fixture = TestBed.createComponent(VotingComponent);
    const component = fixture.componentInstance;
    component.vetoId.set('r1');
    component.clearVetoIfPicked('r1');
    expect(component.vetoId()).toBe('');
  });

  it('clearVetoIfPicked should not clear veto when id does not match', () => {
    const fixture = TestBed.createComponent(VotingComponent);
    const component = fixture.componentInstance;
    component.vetoId.set('r1');
    component.clearVetoIfPicked('r2');
    expect(component.vetoId()).toBe('r1');
  });
});
