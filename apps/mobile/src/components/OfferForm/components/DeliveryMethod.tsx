import {
  type LocationState,
  type OfferLocation,
} from '@vexl-next/domain/src/general/offers'
import {
  useAtom,
  useAtomValue,
  useSetAtom,
  type PrimitiveAtom,
  type WritableAtom,
} from 'jotai'
import {useState} from 'react'
import {YStack} from 'tamagui'
import {useTranslation} from '../../../utils/localization/I18nProvider'
import Info from '../../Info'
import {
  newLocationSessionId,
  type LocationSessionId,
} from '../../LocationSearch/molecule'
import SelectableCell from '../../SelectableCell'
import AddCityOrDistrict from './AddCityOrDistrict'
import SelectLocationFlowModal from './Location/components/SelectLocationFlowModal'
import LocationsList from './LocationsList'

interface Props {
  locationAtom: PrimitiveAtom<OfferLocation[] | undefined>
  locationStateAtom: PrimitiveAtom<LocationState[]>
  randomizeLocation: boolean
  updateLocationStateAndPaymentMethodAtom: WritableAtom<
    null,
    [locationState: LocationState],
    void
  >
}

function DeliveryMethodComponent({
  locationAtom,
  locationStateAtom,
  randomizeLocation,
  updateLocationStateAndPaymentMethodAtom,
}: Props): JSX.Element {
  const {t} = useTranslation()
  const [locations, setLocations] = useAtom(locationAtom)
  const locationState = useAtomValue(locationStateAtom)
  const updateLocationStateAndPaymentMethod = useSetAtom(
    updateLocationStateAndPaymentMethodAtom
  )

  const [locationSearchVisible, setLocationSearchVisible] =
    useState<LocationSessionId | null>(null)

  const onLocationRemove = (locationToRemove: OfferLocation): void => {
    const filteredLocation = locations?.filter(
      (loc) => loc.placeId !== locationToRemove.placeId
    )
    if (filteredLocation) setLocations(filteredLocation)
  }

  return (
    <YStack space="$5">
      <YStack space="$2">
        <SelectableCell
          selected={locationState.includes('IN_PERSON')}
          onPress={() => {
            updateLocationStateAndPaymentMethod('IN_PERSON')
          }}
          title={t('offerForm.pickup')}
          subtitle={t('offerForm.pickupDescription')}
          type="PICKUP"
        />
        {locationState.includes('IN_PERSON') && (
          <YStack space="$1">
            {!!(!locations || (locations && locations.length < 3)) && (
              <AddCityOrDistrict
                onPress={() => {
                  setLocationSearchVisible(newLocationSessionId())
                }}
              />
            )}
            <LocationsList
              locations={locations}
              onLocationRemove={onLocationRemove}
            />
          </YStack>
        )}
      </YStack>
      <YStack space="$2">
        <SelectableCell
          selected={locationState.includes('ONLINE')}
          onPress={() => {
            updateLocationStateAndPaymentMethod('ONLINE')
          }}
          title={t('offerForm.delivery')}
          subtitle={t('offerForm.deliveryDescription')}
          type="DELIVERY"
        />
        {locationState.includes('ONLINE') && (
          <Info text={t('offerForm.pickupDeliveryIsSafer')} />
        )}
      </YStack>
      <SelectLocationFlowModal
        randomizeLocation={randomizeLocation}
        locationSessionId={locationSearchVisible ?? newLocationSessionId()}
        locationAtom={locationAtom}
        onSetVisible={(visible) => {
          if (visible) setLocationSearchVisible(newLocationSessionId())
          else setLocationSearchVisible(null)
        }}
        visible={!!locationSearchVisible}
      />
    </YStack>
  )
}

export default DeliveryMethodComponent
