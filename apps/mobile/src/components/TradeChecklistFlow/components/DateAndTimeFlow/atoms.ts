import {focusAtom} from 'jotai-optics'
import {
  type UnixMilliseconds,
  unixMillisecondsNow,
} from '@vexl-next/domain/dist/utility/UnixMilliseconds.brand'
import {atom, type SetStateAction, type WritableAtom} from 'jotai'
import getValueFromSetStateActionOfAtom from '../../../../utils/atomUtils/getValueFromSetStateActionOfAtom'
import {DateTime} from 'luxon'
import {mainTradeCheckListStateAtom} from '../../atoms'
import {type AvailableDateTimeOption} from '../../domain'

export const mainDateAndTimeStateAtom = focusAtom(
  mainTradeCheckListStateAtom,
  (o) => o.prop('DATE_AND_TIME')
)

export const availableDateTimesAtom = atom<AvailableDateTimeOption[]>([])

export function createTimeOptionAtomForTimeToDropdown(
  timestampTo: UnixMilliseconds
): WritableAtom<UnixMilliseconds, [SetStateAction<UnixMilliseconds>], void> {
  return atom(
    (get) =>
      get(availableDateTimesAtom).find(
        (dateTime) => dateTime.to === timestampTo
      )?.to ?? unixMillisecondsNow(),
    (get, set, selectedTimeTo: SetStateAction<UnixMilliseconds>) => {
      const availableDateTimes = get(availableDateTimesAtom)
      const selectedDateTime = getValueFromSetStateActionOfAtom(selectedTimeTo)(
        () =>
          get(availableDateTimesAtom).find(
            (dateTime) => dateTime.to === selectedTimeTo
          )?.to ?? unixMillisecondsNow()
      )

      const dateTimeToChange = availableDateTimes.find((dateTime) =>
        DateTime.fromMillis(dateTime.to).hasSame(
          DateTime.fromMillis(selectedDateTime),
          'day'
        )
      )

      set(
        availableDateTimesAtom,
        availableDateTimes.map((dateTime) =>
          dateTime.to === dateTimeToChange?.to
            ? {...dateTime, to: selectedDateTime}
            : dateTime
        )
      )
    }
  )
}

export function createTimeOptionAtomForTimeFromDropdown(
  timestamp: UnixMilliseconds
): WritableAtom<UnixMilliseconds, [SetStateAction<UnixMilliseconds>], void> {
  return atom(
    (get) =>
      get(availableDateTimesAtom).find(
        (dateTime) => dateTime.from === timestamp
      )?.from ?? unixMillisecondsNow(),
    (get, set, selectedTimeFrom: SetStateAction<UnixMilliseconds>) => {
      const availableDateTimes = get(availableDateTimesAtom)
      const selectedDateTime = getValueFromSetStateActionOfAtom(
        selectedTimeFrom
      )(
        () =>
          get(availableDateTimesAtom).find(
            (dateTime) => dateTime.from === selectedTimeFrom
          )?.from ?? unixMillisecondsNow()
      )

      const dateTimeToChange = availableDateTimes.find((dateTime) =>
        DateTime.fromMillis(dateTime.from).hasSame(
          DateTime.fromMillis(selectedDateTime),
          'day'
        )
      )

      set(
        availableDateTimesAtom,
        availableDateTimes.map((dateTime) =>
          dateTime.from === dateTimeToChange?.from
            ? {
                ...dateTime,
                from: selectedDateTime,
                to:
                  dateTime.to < selectedDateTime
                    ? selectedDateTime
                    : dateTime.to,
              }
            : dateTime
        )
      )
    }
  )
}

export const removeTimestampFromAvailableAtom = atom(
  null,
  (get, set, date: UnixMilliseconds) => {
    const availableDateTimes = get(availableDateTimesAtom)
    set(
      availableDateTimesAtom,
      availableDateTimes.filter((dateTime) => dateTime.date !== date)
    )
  }
)

export const syncAvailableDateTimesWithMainStateActionAtom = atom(
  null,
  (get, set) => {
    const mainDateAndTimeState = get(mainDateAndTimeStateAtom)
    set(availableDateTimesAtom, mainDateAndTimeState.data)
  }
)

export const saveLocalDateTimeStateToMainStateActionAtom = atom(
  null,
  (get, set) => {
    const data = get(availableDateTimesAtom)
    set(mainDateAndTimeStateAtom, {status: 'pending', data})
  }
)