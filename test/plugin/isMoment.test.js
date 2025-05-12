import MockDate from 'mockdate';
import { afterEach, beforeEach, expect, it } from 'vitest';
import dayjs, { isMoment } from '../../dist';

dayjs.extend(isMoment);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('IsLeapYear', () => {
  expect(dayjs.isMoment(dayjs())).toBe(true);
  expect(dayjs.isMoment(new Date())).toBe(false);
});
