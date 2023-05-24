import {atomWithParsedMmkvStorage} from '../atomUtils/atomWithParsedMmkvStorage'
import {Preferences} from './domain'

export const preferencesAtom = atomWithParsedMmkvStorage(
  'preferences',
  {showDebugNotifications: false},
  Preferences
)