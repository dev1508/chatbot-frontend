import { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Chatbot.css';

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { sendMessageToAPI, editMessageAPI, deleteMessageAPI } from "../services/api";

interface ChatMessage {
  id: number;
  message_id: number,
  message: string;
  sender: string;
}

function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      message_id: 0,
      message: "Hello, I'm Ava! Ask me anything!",
      sender: 'Chatbot',
    },
  ]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  
  function get_message_id(id:number): number {
    const res = messages.find((obj) => obj.id === id);
    const msg_id = res?.message_id;
    return msg_id ?? 0;
  } 

  const handleSend = async (message: string) => {
    if (editingMessageId !== null) {
      await handleEditMessage(editingMessageId, message);
    } else {
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        message_id: -1,
        message,
        sender: 'user',
      };

      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      setIsTyping(true);
      await handleSendMessage(newMessages);

      setUserMessage('');
    }
  };

  const handleSendMessage = async (chatMessages: ChatMessage[]) => {
    try {
      const userMessage = chatMessages[chatMessages.length - 1].message;
      const response = await sendMessageToAPI(userMessage);

      chatMessages[chatMessages.length - 1].message_id = response.id;

      setMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          message_id: response.id,
          message: response.chat_response || '',
          sender: 'Chatbot',
        },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (id: number, message: string) => {
    try {
      const msg_id = get_message_id(id);
      const response = await editMessageAPI(msg_id, message);

      var temp_messages = messages.map((msg) =>
        msg.id === id ? { ...msg, message_id: response.id, message: message } : msg
      );
      temp_messages = temp_messages.map((msg) =>
        msg.id === id + 1 ? { ...msg, message_id: response.id, message: response.chat_response || '' } : msg
      );

      setMessages(temp_messages);
      setEditingMessageId(null);
      setUserMessage('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      const msg_id = get_message_id(id);
      await deleteMessageAPI(get_message_id(id));

      const updatedMessages = messages.filter((msg) => msg.message_id !== msg_id);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const initiateEdit = (id: number, userMessage: string) => {
    setUserMessage(userMessage);
    setEditingMessageId(id);
  };

  return (
    <div className="App">
      <div style={{ position: 'relative', height: '600px', width: '700px' }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? <TypingIndicator content="Chatbot is typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return (
                  <div className={message.sender === 'user' ? "message-container" : ""} key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <Message
                      model={{
                        message: message.message,
                        sender: message.sender,
                        direction: message.sender === 'user' ? 'outgoing' : 'incoming',
                        position: 'normal',
                      }}
                      className="message-text"
                    />
                    {message.sender === 'user' && (
                      <div className="message-buttons">
                        <button className="fancy-button edit-button" style={{ marginLeft: '10px' }} onClick={() => initiateEdit(message.id, message.message)}>Edit</button>
                        <button className="fancy-button delete-button" style={{ marginLeft: '10px' }} onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </MessageList>

            <MessageInput
              placeholder="Type message here"
              value={userMessage}
              onSend={handleSend}
              onChange={(val) => setUserMessage(val)}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default Chatbot;