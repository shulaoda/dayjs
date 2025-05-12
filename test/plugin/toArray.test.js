import MockDate from 'mockdate';
import moment from 'moment';
import { afterEach, beforeEach, expect, it } from 'vitest';
import dayjs, { toArray } from '../../dist';

dayjs.extend(toArray);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

it('As Array -> toArray', () => {
  expect(dayjs().toArray()).toEqual(moment().toArray());
});
