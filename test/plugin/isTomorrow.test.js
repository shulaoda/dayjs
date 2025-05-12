import MockDate from 'mockdate';
import { afterEach, beforeEach, expect, it } from 'vitest';
import dayjs, { isTomorrow } from '../../dist';

dayjs.extend(isTomorrow);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('is tomorrow', () => {
  expect(dayjs().add(1, 'day').isTomorrow()).toBeTruthy();
  expect(dayjs('2017-01-01').isTomorrow('2019-01-01', '2017-01-01'))
    .toBeFalsy();
});
