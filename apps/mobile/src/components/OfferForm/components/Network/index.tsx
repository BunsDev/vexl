import {type BtcNetwork} from '@vexl-next/domain/src/general/offers'
import {useAtom, type PrimitiveAtom} from 'jotai'
import {YStack} from 'tamagui'
import SelectableCell from '../../../SelectableCell'
import useContent from './useContent'

interface Props {
  btcNetworkAtom: PrimitiveAtom<BtcNetwork[] | undefined>
}

function Network({btcNetworkAtom}: Props): JSX.Element | null {
  const content = useContent()
  const [btcNetwork, setBtcNetwork] = useAtom(btcNetworkAtom)

  const onNetworkSelect = (type: BtcNetwork): void => {
    if (btcNetwork?.includes(type) && btcNetwork.length > 1) {
      const selectedNetworks = btcNetwork.filter((method) => method !== type)
      setBtcNetwork(selectedNetworks)
    } else if (!btcNetwork?.includes(type)) {
      setBtcNetwork([...(btcNetwork ?? []), type])
    }
  }

  return (
    <YStack space="$2">
      {content.map((cell) => (
        <SelectableCell
          key={cell.type}
          selected={btcNetwork?.includes(cell.type) ?? false}
          onPress={onNetworkSelect}
          title={cell.title}
          subtitle={cell.subtitle}
          type={cell.type}
        />
      ))}
    </YStack>
  )
}

export default Network
