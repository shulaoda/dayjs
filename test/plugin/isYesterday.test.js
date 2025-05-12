import MockDate from 'mockdate';
import { afterEach, beforeEach, expect, it } from 'vitest';
import dayjs, { isYesterday } from '../../dist';

dayjs.extend(isYesterday);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('is yesterday', () => {
  expect(dayjs().subtract(1, 'day').isYesterday()).toBeTruthy();
  expect(dayjs('2017-01-01').isYesterday()).toBeFalsy();
});
