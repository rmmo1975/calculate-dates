import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import isBefore from 'date-fns/isBefore';
import nextDay from 'date-fns/nextDay';

enum DaysOfTheWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

class CalculateDates {
  /**
   * @param {DaysOfTheWeek[]} possibleDaysOfTheWeekToSchedule - it can be one, some or all days of the week [ Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday ]
   * @param {string} timezone - valid timezone in USA based on tz_database
   * @param {Date | undefined} currentDatetime -  any valid datetime. if no valid date is informed, a new one will be create based on the current datetime
   * @return {Date} returned the date found
   */
  public static nextDate(possibleDaysOfTheWeekToSchedule: DaysOfTheWeek[], timezone: string, currentDatetime?: Date | undefined): Date | undefined {
    currentDatetime = currentDatetime || new Date();
    const pattern = 'yyyy-MM-dd HH:mm:ss.SSS'
    // get the date without timezone info (like GMT-0500). String representation of the current datetime
    // It will be necessary to keep the current datetime at the refered timezone
    const zonedCurrentDatetime = format(utcToZonedTime(currentDatetime, timezone), pattern);
    console.log(' -- current zoned datetime: ', zonedCurrentDatetime);
  
    // set the cutoff time of the current datetime
    const zonedCutoffDatetime = `${zonedCurrentDatetime.substring(0, 10)} 02:00:00.000`;
    console.log(' -- cutoff datetime:     ', zonedCutoffDatetime);
  
    // generate a list of possible days to schedule 
    const listOfPossibleDates = this.listPossibleDates(possibleDaysOfTheWeekToSchedule, zonedTimeToUtc(zonedCutoffDatetime, timezone));
  
    console.log(' ----> list of possible dates: ', listOfPossibleDates)
  
    return listOfPossibleDates.find(date => {
      return isBefore(currentDatetime!, date);
    });
  }

  private static listPossibleDates(daysOfTheWeekNeeded: DaysOfTheWeek[], referenceUtcDatetime: Date): Date[] {
    const listOfPossibleDates: Date[] = [];
    daysOfTheWeekNeeded.forEach(dayOfTheWeek => {
      listOfPossibleDates.push(nextDay(referenceUtcDatetime, dayOfTheWeek));
    });
    return listOfPossibleDates.sort((a, b) => a <= b ? -1 : 0);
  }
}

export default { DaysOfTheWeek, CalculateDates };

let myDate = CalculateDates.nextDate([DaysOfTheWeek.SATURDAY, DaysOfTheWeek.TUESDAY, DaysOfTheWeek.WEDNESDAY], 'America/Chicago', new Date('2021-09-15T03:00:00.000Z'));
console.log('date found: ', myDate);

myDate = CalculateDates.nextDate([DaysOfTheWeek.SATURDAY, DaysOfTheWeek.TUESDAY, DaysOfTheWeek.WEDNESDAY], 'America/Los_Angeles', new Date('2021-09-15T03:00:00.000Z'));
console.log('date found: ', myDate);


