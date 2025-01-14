import {
  longitudeDeltaToMeters,
  type Latitude,
  type Longitude,
  type Radius,
} from '@vexl-next/domain/src/utility/geoCoordinates'
import {
  atom,
  useAtomValue,
  useSetAtom,
  type Atom,
  type WritableAtom,
} from 'jotai'
import {Fragment, useCallback, useEffect, useRef} from 'react'
import {Platform} from 'react-native'
import MapView from 'react-native-map-clustering'
import {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type Details,
  type EdgePadding,
  type Region,
} from 'react-native-maps'
import {Stack, getTokens, useDebounce} from 'tamagui'
import europeRegion from '../utils/europeRegion'
import mapTheme from '../utils/mapStyle'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const markerImage = require('../img/pin.png')

export interface Point<T> {
  data: T
  id: string
  latitude: Latitude
  longitude: Longitude
  radius: Radius
}

interface Props<T> {
  mapPadding: EdgePadding
  pointsAtom: Atom<Array<Point<T>>>
  onPointPress: (p: Point<T>) => void
  pointIdsToFocusAtom: Atom<Array<Point<T>['id']> | undefined>
  onRegionChangeComplete?: (region: Region, d: Details) => void
  refAtom?: WritableAtom<null, [v: MapView], void>
  onMapReady?: () => void
}

const emptyAtom = atom<MapView | undefined>(undefined)

const mapStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
} as const

function MMapView({
  children,
  refAtom,
  mapPadding,
  onMapReady,
  onRegionChangeComplete,
}: {
  children: React.ReactNode
  refAtom?: WritableAtom<null, [v: MapView], void>
  mapPadding: EdgePadding
  onMapReady?: () => void
  onRegionChangeComplete?: (region: Region, d: Details) => void
}): JSX.Element {
  const ref = useRef<MapView>(null)
  const setMapViewRef = useSetAtom(refAtom ?? emptyAtom)
  const loadedCallbackCalledRef = useRef(false)

  const onMapLoaded = useCallback(() => {
    if (loadedCallbackCalledRef.current) return
    loadedCallbackCalledRef.current = true
    onMapReady?.()
  }, [onMapReady])

  useEffect(() => {
    setMapViewRef(ref.current ?? undefined)
  }, [ref, setMapViewRef])

  const onChangedDebounce = useDebounce(
    useCallback(
      (region: Region, details: Details) => {
        if (onRegionChangeComplete) onRegionChangeComplete(region, details)
      },
      [onRegionChangeComplete]
    ),
    500
  )

  return (
    <MapView
      ref={ref}
      initialRegion={europeRegion}
      clusterColor={getTokens().color.main.val}
      customMapStyle={mapTheme}
      onMapLoaded={onMapLoaded}
      minZoom={0}
      maxZoom={20}
      loadingBackgroundColor="#000000"
      loadingIndicatorColor={getTokens().color.main.val}
      clusteringEnabled
      loadingEnabled
      provider={PROVIDER_GOOGLE}
      mapPadding={mapPadding}
      toolbarEnabled={false}
      style={mapStyle}
      onRegionChange={onChangedDebounce}
    >
      {children}
    </MapView>
  )
}

export default function MapDisplayMultiplePoints<T>({
  pointIdsToFocusAtom,
  mapPadding,
  onPointPress,
  pointsAtom,
  onRegionChangeComplete,
  refAtom,
  onMapReady,
}: Props<T>): JSX.Element {
  const points = useAtomValue(pointsAtom)
  const idsToFocus = useAtomValue(pointIdsToFocusAtom)
  const {focusedPoints, notFocusedPoints} = points.reduce(
    (acc, point) => {
      const isFocused = idsToFocus?.includes(point.id)
      if (isFocused) {
        acc.focusedPoints.push(point)
      } else {
        acc.notFocusedPoints.push(point)
      }
      return acc
    },
    {
      focusedPoints: [] as Array<Point<T>>,
      notFocusedPoints: [] as Array<Point<T>>,
    }
  )

  return (
    <Stack w="100%" h="100%" position="relative">
      <MMapView
        refAtom={refAtom}
        mapPadding={mapPadding}
        onMapReady={onMapReady}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {notFocusedPoints.map((point) => {
          return (
            <Marker
              key={point.id}
              // https://github.com/react-native-maps/react-native-maps/issues/4997
              tracksViewChanges={Platform.OS === 'ios'}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              onPress={() => {
                onPointPress(point)
              }}
            >
              <Stack w={28} h={28} alignItems="center" justifyContent="center">
                <Stack w={8} h={8} borderRadius={4} bg="$main" />
              </Stack>
            </Marker>
          )
        })}
        {focusedPoints.map((point) => {
          return (
            <Fragment key={point.id}>
              <Marker
                //  https://github.com/react-native-maps/react-native-maps/issues/4997
                tracksViewChanges={Platform.OS === 'ios'}
                image={markerImage}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
              ></Marker>
              <Circle
                fillColor={`${getTokens().color.main.val}22`}
                strokeColor={getTokens().color.main.val}
                center={point}
                radius={longitudeDeltaToMeters(point.radius, point.latitude)}
              ></Circle>
            </Fragment>
          )
        })}
      </MMapView>
    </Stack>
  )
}
