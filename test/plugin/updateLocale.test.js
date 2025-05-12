import MockDate from 'mockdate';
import moment from 'moment';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import dayjs, { localizedFormat, updateLocale } from '../../dist';

dayjs.extend(updateLocale);
dayjs.extend(localizedFormat);

beforeEach(() => {
  MockDate.set(new Date());
});

afterEach(() => {
  MockDate.reset();
});

const newLocale = {
  months: new Array(12).fill('testMonth'),
  formats: { // formats for dayjs and longDateFormat for momentjs
    LT: '[testFormat]',
  },
  longDateFormat: {
    LT: '[testFormat]',
  },
};

const formatString = 'MMMM LT';

describe('Update locale', () => {
  it('Invalid argument', () => {
    const result = dayjs.updateLocale('InvalidLocaleName', {});
    expect(result)
      .toEqual(undefined);
    expect(dayjs().format(formatString))
      .toEqual(moment().format(formatString));
  });

  it('Return value', () => {
    const result1 = dayjs.updateLocale('en');
    expect(typeof result1).toEqual('object');
    const result2 = dayjs.updateLocale('en', {});
    expect(typeof result2).toEqual('object');
    const result3 = dayjs.updateLocale('en', newLocale);
    expect(typeof result3).toEqual('object');
  });

  it('Update build-in en locale', () => {
    moment.updateLocale('en', newLocale);
    dayjs.updateLocale('en', newLocale);

    expect(dayjs().format(formatString))
      .toEqual('testMonth testFormat');

    expect(dayjs().format(formatString))
      .toEqual(moment().format(formatString));
  });

  it('Update invalid date string', () => {
    const locale = 'en';
    const localeSetting = { invalidDate: 'bad date' };
    dayjs.updateLocale(locale, localeSetting);
    moment.updateLocale(locale, localeSetting);
    dayjs.locale(locale);
    moment.locale(locale);
    expect(dayjs('').format()).toBe(moment('').format());
    expect(dayjs('otherString').format()).toBe(moment('otherString').format());
  });
});
