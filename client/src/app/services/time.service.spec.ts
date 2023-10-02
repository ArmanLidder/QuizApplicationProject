import { TimeService } from './time.service';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';

describe('TimeService', () => {
    let component: TimeService;
    let stopTimerSpy: jasmine.Spy;
    const DEFAULTTIMERVALUE = 10;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        component = TestBed.inject(TimeService);
        component.deleteAllTimers();
    });

    it('should create a timer', () => {
        const TIMER = component.createTimer(DEFAULTTIMERVALUE);
        expect(TIMER).toBeDefined();
        expect(component.timersArray).toContain(TIMER);
    });

    it('should delete a timer by index', () => {
        const TIMER1 = component.createTimer(DEFAULTTIMERVALUE);
        const TEMPTIMERVALUE = 20;
        const TIMER2 = component.createTimer(TEMPTIMERVALUE);

        component.deleteTimerByIndex(0);

        expect(component.timersArray).not.toContain(TIMER1);
        expect(component.timersArray).toContain(TIMER2);
    });

    it('should delete all timers', () => {
        const TIMER1 = component.createTimer(DEFAULTTIMERVALUE);
        const TEMPTIMERVALUE = 20;
        const TIMER2 = component.createTimer(TEMPTIMERVALUE);
        stopTimerSpy = spyOn(component, 'stopTimer');

        component.deleteAllTimers();

        expect(stopTimerSpy).toHaveBeenCalledWith(0);
        expect(stopTimerSpy).toHaveBeenCalledWith(1);
        expect(component.timersArray).not.toContain(TIMER1);
        expect(component.timersArray).not.toContain(TIMER2);
    });

    it('should get a timer by index', () => {
        const TIMER1 = component.createTimer(DEFAULTTIMERVALUE);

        component.getTime(0);

        expect(component.getTimer(0)).toBe(TIMER1);
    });

    it('should get the initial value of a timer by index', () => {
        component.createTimer(DEFAULTTIMERVALUE);

        component.getInitialValue(0);

        expect(component.getInitialValue(0)).toBe(DEFAULTTIMERVALUE);
    });

    it('should set the time of a timer by index', () => {
        const TEMPTIMERVALUE = 20;
        component.createTimer(TEMPTIMERVALUE);

        component.setTime(0, DEFAULTTIMERVALUE);

        expect(component.getTime(0)).toBe(DEFAULTTIMERVALUE);
    });

    it('should not setIntervalValue if intervalValue is already defined', () => {
        const TEMPINTERVALVALUE = 123;
        component.createTimer(DEFAULTTIMERVALUE).setIntervalValue(TEMPINTERVALVALUE);
        component.startTimer(0);

        expect(component.getTimer(0).intervalValue).toBeDefined();
    });

    it('should setIntervalValue if intervalValue is undefined', () => {
        component.createTimer(DEFAULTTIMERVALUE).setIntervalValue(undefined);
        component.startTimer(0);

        expect(component.getTimer(0).intervalValue).toBeDefined();
    });

    it('should decrement the timer correctly', fakeAsync(() => {
        const TICKVALUE = 1000;
        stopTimerSpy = spyOn(component, 'stopTimer');
        component.createTimer(DEFAULTTIMERVALUE);

        component.startTimer(0);
        tick(TICKVALUE);
        expect(component.getTime(0)).toBe(DEFAULTTIMERVALUE - 1);
        tick(TICKVALUE);
        expect(component.getTime(0)).toBe(DEFAULTTIMERVALUE - 2);
        discardPeriodicTasks();

        component.setTime(0, 0);
        tick(TICKVALUE);
        expect(stopTimerSpy).toHaveBeenCalledWith(0);
        discardPeriodicTasks();
    }));

    it('should stop the timer and set intervalValue to undefined', () => {
        const TIMER = component.createTimer(DEFAULTTIMERVALUE);
        component.startTimer(0);
        const SPYSETINTERVALVALUE = spyOn(TIMER, 'setIntervalValue');
        spyOn(window, 'clearInterval');

        component.stopTimer(0);

        expect(window.clearInterval).toHaveBeenCalledWith(component.getTimer(0).intervalValue);
        expect(SPYSETINTERVALVALUE).toHaveBeenCalledWith(undefined);
    });
});
