import {useMolecule} from 'bunshi/dist/react'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'
import {fetchAndStoreMessagesForInboxAtom} from '../../../state/chat/atoms/fetchNewMessagesActionAtom'
import {useAppState} from '../../../utils/useAppState'
import Screen from '../../Screen'
import {chatMolecule} from '../atoms'
import ChatInfoModal from './ChatInfoModal'
import MarkAsReadWhenRendered from './MarkAsReadWhenRendered'
import MessagesScreen from './MessagesScreen'
import RequestScreen from './RequestScreen'

export default function MessagesListOrApprovalPreview(): JSX.Element {
  const {chatUiModeAtom, chatAtom, publicKeyPemBase64Atom} =
    useMolecule(chatMolecule)
  const chatUiMode = useAtomValue(chatUiModeAtom)
  const fetchAndStoreMessagesForInbox = useSetAtom(
    fetchAndStoreMessagesForInboxAtom
  )
  const publicKeyPemBase64 = useAtomValue(publicKeyPemBase64Atom)

  useAppState(
    useCallback(() => {
      void fetchAndStoreMessagesForInbox({
        key: publicKeyPemBase64,
      })()
    }, [fetchAndStoreMessagesForInbox, publicKeyPemBase64])
  )

  const toRender =
    chatUiMode === 'approval' ? <RequestScreen /> : <MessagesScreen />

  return (
    <>
      <MarkAsReadWhenRendered chatAtom={chatAtom} />
      <Screen>{toRender}</Screen>
      <ChatInfoModal />
    </>
  )
}
