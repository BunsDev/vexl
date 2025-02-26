import {flow} from 'fp-ts/lib/function'
import addToSortedArray from '../../../utils/addToSortedArray'
import {type ChatMessageWithState, type ChatWithMessages} from '../domain'
import areMessagesEqual from './areMessagesEqual'
import compareMessages from './compareMessages'

function updateChatVersion(
  message: ChatMessageWithState
): (chat: ChatWithMessages) => ChatWithMessages {
  return (chat) => {
    if (!message.message.myVersion) return chat

    switch (message.state) {
      case 'received':
      case 'receivedButRequiresNewerVersion':
        return {
          ...chat,
          chat: {
            ...chat.chat,
            otherSideVersion:
              message.message?.myVersion ?? chat.chat.otherSideVersion,
          },
        }
      case 'sending':
      case 'sendingError':
      case 'sent':
        return {
          ...chat,
          chat: {
            ...chat.chat,
            lastReportedVersion:
              message.message?.myVersion ?? chat.chat.lastReportedVersion,
          },
        }
    }
  }
}

export default function addMessageToChat(
  message: ChatMessageWithState
): (chat: ChatWithMessages) => ChatWithMessages {
  return flow(
    (chat) =>
      message.message.messageType === 'VERSION_UPDATE'
        ? chat
        : ({
            ...chat,
            messages: addMessageToMessagesArray(chat.messages)(message),
          } satisfies ChatWithMessages),
    updateChatVersion(message)
  )
}

function addMessageToMessagesArray(
  messages: ChatMessageWithState[]
): (args: ChatMessageWithState) => ChatMessageWithState[] {
  return (message) =>
    addToSortedArray(messages, compareMessages, areMessagesEqual)(message)
}
