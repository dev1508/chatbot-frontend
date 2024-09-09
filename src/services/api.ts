import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/messages';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const delayTime = 0;

export const sendMessageToAPI = async (userMessage: string) => {
    await delay(delayTime);
    try {
    const response = await axios.post(API_BASE_URL, {
      user_message: userMessage,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const editMessageAPI = async (id: number, userMessage: string) => {
    await delay(delayTime);
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, {
      user_message: userMessage,
    });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const deleteMessageAPI = async (id: number) => {
    await delay(delayTime);
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return { status: 'Message deleted successfully' };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};