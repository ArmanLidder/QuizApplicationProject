import { Timer } from './timer';

describe('Timer', () => {
  let timer: Timer;

  beforeEach(() => {
    // Initialize a new Timer instance with an initial value of 60
    timer = new Timer(60);
  });

  it('should initialize with the correct initial time', () => {
    expect(timer.initialTime).toBe(60);
  });

  it('should initialize with the correct current time', () => {
    expect(timer.time).toBe(60);
  });

  it('should set the time correctly', () => {
    timer.setTime(45);
    expect(timer.time).toBe(45);
  });

  it('should set the interval value correctly', () => {
    timer.setIntervalValue(1000);
    expect(timer.intervalValue).toBe(1000);
  });
});
