import {type OfferInfo} from '@vexl-next/domain/src/general/offers'
import {Stack, Text, XStack, getTokens} from 'tamagui'
import pauseSvg from '../../images/pauseSvg'
import {isOfferExpired} from '../../utils/isOfferExpired'
import {useTranslation} from '../../utils/localization/I18nProvider'
import SvgImage from '../Image'
import clockSvg from '../images/clockSvg'
import BtcOfferColumns from './components/BtcOfferColumns'
import ProductAndOtherOfferColumns from './components/ProductAndOtherOfferColumns'

// const BTC_PRAGUE_FRIEND = '8o5OvkfRga/xBYbfb0e0MJZIjy4g7xGVimCdNLrydGs='
// const BTC_PRAGUE_FRIEND_STAGE = '9c6r0q7LCn1oqES2pfqQDVQH91fY8ZHYcJKbJYOU7hE='

function OfferInfoPreview({
  offer,
  negative,
  reduceDescriptionLength,
}: {
  offer: OfferInfo
  negative?: boolean
  reduceDescriptionLength?: boolean
}): JSX.Element {
  const {t} = useTranslation()
  // const btcPragueLogoSvg = useMemo(
  //   () => getBtcPragueLogoSvg({darkBackground: negative}),
  //   [negative]
  // )

  return (
    <>
      {/* {(offer.privatePart.commonFriends.includes(BTC_PRAGUE_FRIEND) ||
        offer.privatePart.commonFriends.includes(BTC_PRAGUE_FRIEND_STAGE)) && (
        <Stack f={1} ai="center" jc="space-between">
          <SvgImage width={60} height={20} source={btcPragueLogoSvg} />
        </Stack>
      )} */}
      {!!offer.publicPart.listingType && (
        <Stack
          ai="center"
          jc="center"
          als="flex-start"
          bc="$greyAccent5"
          py="$2"
          px="$3"
          br="$3"
          mb="$3"
        >
          <Text fos={12} col="$greyOnWhite" ff="$body600">
            {t(`offerForm.${offer.publicPart.listingType}`)}
          </Text>
        </Stack>
      )}
      <XStack ai="flex-start" jc="space-between">
        <XStack mb="$4">
          <Text
            flex={1}
            numberOfLines={reduceDescriptionLength ? 5 : undefined}
            ellipsizeMode={reduceDescriptionLength ? 'tail' : undefined}
            fos={20}
            color={negative ? '$greyOnBlack' : '$black'}
            ff="$body500"
          >
            {offer.publicPart.offerDescription}
          </Text>
          <XStack space="$1">
            {isOfferExpired(offer.publicPart.expirationDate) && (
              <SvgImage
                stroke={getTokens().color.$greyOnBlack.val}
                source={clockSvg}
              />
            )}
            {!offer.publicPart.active && (
              <SvgImage
                stroke={getTokens().color.$greyOnBlack.val}
                source={pauseSvg}
              />
            )}
          </XStack>
        </XStack>
      </XStack>
      <XStack space="$1">
        {!offer.publicPart.listingType ||
        offer.publicPart.listingType === 'BITCOIN' ? (
          <BtcOfferColumns offer={offer} />
        ) : (
          <ProductAndOtherOfferColumns offer={offer} />
        )}
      </XStack>
    </>
  )
}

export default OfferInfoPreview
