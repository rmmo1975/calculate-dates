// import { format, compareAsc } from 'date-fns';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import isBefore from 'date-fns/isBefore';
import nextDay from 'date-fns/nextDay';
import setDay from 'date-fns/setDay';
import setHours from 'date-fns/setHours';

// format(new Date(2014, 1, 11), 'MM/dd/yyyy')
// //=> '02/11/2014'

// const dates = [
//   new Date(1995, 6, 2),
//   new Date(1987, 1, 11),
//   new Date(1989, 6, 10),
// ]

// console.log(dates.sort(compareAsc));
// const utcDate = zonedTimeToUtc('2018-09-01 18:01:36.386', 'Europe/Berlin')

// Set 4 hours to 1 September 2014 11:30:00:
const originalTime = new Date(2014, 8, 15, 3, 0);
const result = setHours(originalTime, 2)
//=> Mon Sep 01 2014 04:30:00
console.log('---- setting hours: ', result, ' from: ', originalTime);

// Obtain a Date instance that will render the equivalent Berlin time for the UTC date
const date = new Date('2021-09-15T03:00:00.000Z')
console.log(date);
const timeZone = 'America/Chicago'
const zonedDate = utcToZonedTime(date, timeZone)
// zonedDate could be used to initialize a date picker or display the formatted local date/time
console.log('-- output zonedDate: ', zonedDate);

// Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
const pattern = 'dd.MM.yyyy HH:mm:ss.SSS \'GMT\' XXX (z)'
const output = format(zonedDate, pattern, { timeZone: 'America/Chicago' })

console.log('-- output variable: ', output);

enum DaysOfTheWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

// let's create the same function we have in oxygen

// in this example we'll get possible days of the week that are possible days to schedule an appointment
// but it depends of the GP in some location in united states
// Following the list of timezones (based on tz_database/IANA https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
// and knowing that each GP works 9-5 and each accepts appointments 'til 7am
// return the next possible day from a list of days of weeks that the GP is open

/**
 * @param {DaysOfTheWeek[]} possibleDaysOfTheWeekToSchedule - it can be one, some or all days of the week [ Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday ]
 * 
 * @param {string} GPTimezone - valid timezone in USA based on tz_database
 * 
 * @param {Date | undefined} currentTime -  any valid datetime. if no valid date is informed, a new one will be create based on the current datetime
 * 
 * @return {Date} returned the date found
 */

const getNextDateToGP = (possibleDaysOfTheWeekToSchedule: DaysOfTheWeek[], GPTimezone: string, currentTime?: Date | undefined): Date | undefined => {

  console.log(possibleDaysOfTheWeekToSchedule);

  currentTime = currentTime || new Date();
  console.log('---> current datetime: ', currentTime.toISOString());
  const pattern = 'yyyy-MM-dd HH:mm:ss.SSS'
  // get the date without timezone info (like GMT-0500). String representation of the current datetime
  // It will be necessary to keep the current datetime at the refered timezone
  const GPCurrentDatetime = format(utcToZonedTime(currentTime, GPTimezone), pattern);
  console.log(' -- current GP datetime: ', GPCurrentDatetime);

  // set the cutoff time of the current datetime
  const cutOffGPFromCurrentDatetime = `${GPCurrentDatetime.substring(0, 10)} 02:00:00.000`;
  console.log(' -- cutoff datetime:     ', cutOffGPFromCurrentDatetime);

  console.log('--- current datetime: ', currentTime);

  let setDayOfTheWeek = setDay(new Date(cutOffGPFromCurrentDatetime), 3);

  console.log('--> setting day of the week? ', zonedTimeToUtc(setDayOfTheWeek, GPTimezone));

  // generate a list of possible days to schedule 
  const listOfPossibleDates = getListOfPossibleDates(possibleDaysOfTheWeekToSchedule, zonedTimeToUtc(cutOffGPFromCurrentDatetime, GPTimezone));

  console.log(' ----> list of possible dates: ', listOfPossibleDates)

  return listOfPossibleDates.find(date => {
    return isBefore(currentTime!, date);
  });

//   console.log(`Function-getNextWeekdayToGP|possibleDaysOfTheWeekToScheduleMember=${possibleDaysOfTheWeekToSchedule}|GPTimezone=${GPTimezone}`);
//   // get the current UTC time informed and set to the GP timezone
//   let currentDayGPTime = moment(currentTime).tz(GPTimezone);
//   let cutoffGPTime = currentDayGPTime.clone().set({ 'hour': 2, 'minute': 0, 'second': 0 });

//   console.log(`Function-getNextWeekdayToGP|currentDayForGPTime=${currentDayGPTime}|cutoffGPTime=${cutoffGPTime}`);

//   const potentitialGPDates = [];
//   for (const weekDayName of possibleDaysOfTheWeekToSchedule) {
//     potentitialGPDates.push(...findNextDateByName(weekDayName, currentDayGPTime.toDate()));
//   }

//   console.log(`Function-getNextWeekdayToGP|potentitialGPDates=${potentitialGPDates}`);

//   const sortedDates = potentitialGPDates.sort((a, b) => {
//     return a.getTime() <= b.getTime() ? -1 :0 // sorting ascending criteria
//   });

//   console.log(`Function-getNextWeekdayToGP|sortedDates=${sortedDates}`);

//   const GPDate = sortedDates.find(date => {
//     const isFuture = moment(date).isAfter(currentDayGPTime);
//     const isToday =  moment(date).isSame(currentDayGPTime, 'day');
//     console.log(`
// *** internal sorted find:
//       - is future: ${isFuture}   'moment(date).isAfter(currentDayGPTime)'
//       - is today:  ${isToday}    'moment(date).isSame(currentDayGPTime, 'day');'
//       - current Date item:       ${moment(date)}
//       - GP cutoff datetime: ${cutoffGPTime}
//       - currentDayGPTime:   ${currentDayGPTime}
//       - current Date item 
//         isSameOrBefore cutoff:   ${moment(date).isSameOrBefore(cutoffGPTime)}
// `);
//     if (isToday) {
//       const meetCutOffTime = moment(date).isSameOrBefore(cutoffGPTime);
//       return meetCutOffTime;
//     } else if (isFuture) {
//       return true;
//     } else {
//       return false;
//     }
//   });

//   console.log(`Function-getNextWeekdayToGP|GPDate=${GPDate}`);


};

const getListOfPossibleDates = (daysOfTheWeekNeeded: DaysOfTheWeek[], referenceUtcDatetime: Date): Date[] => {
  
  const listOfPossibleDates: Date[] = [];

  daysOfTheWeekNeeded.forEach(dayOfTheWeek => {
    listOfPossibleDates.push(nextDay(referenceUtcDatetime, dayOfTheWeek));
  });

  return listOfPossibleDates.sort((a, b) => a <= b ? -1 : 0);
};


const myDate = getNextDateToGP([DaysOfTheWeek.SATURDAY, DaysOfTheWeek.TUESDAY, DaysOfTheWeek.WEDNESDAY], 'America/Chicago', new Date('2021-09-15T03:00:00.000Z'));

console.log('date found: ', myDate?.toISOString());
console.log('date found: ', utcToZonedTime(new Date('2021-09-15T07:00:00.000Z'), 'America/Sao_Paulo').toISOString());

// console.log('date found: ', format(utcToZonedTime(new Date('2021-09-15T07:00:00.000Z'), 'America/Chicago'), pattern));
//console.log('date found: ', formatISO(utcToZonedTime(new Date('2021-09-15T07:00:00.000Z'), 'America/Chicago'), { representation: 'complete' }));
//console.log('date found: ', utcToZonedTime(myDate!, 'Amercia/Sao_Paulo'));
console.log('date found: ', format(zonedTimeToUtc('2021-09-14 02:00:00.000', 'America/Chicago'), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXX'));
// console.log('date found: ', formatISO(utcToZonedTime(zonedTimeToUtc('2021-09-14 02:00:00.000', 'America/Chicago'), 'America/Chicago')));

// console.log('date found: ', utcToZonedTime(format(myDate!, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXX'), 'America/Chicago'));