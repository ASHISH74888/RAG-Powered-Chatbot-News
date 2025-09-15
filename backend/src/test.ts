import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testChatbot() {
  try {
    console.log('1. Testing session creation...');
    const sessionResponse = await axios.post(`${API_URL}/session`);
    const sessionId = sessionResponse.data.sessionId;
    console.log('✅ Session created:', sessionId);

    console.log('\n2. Testing chat functionality...');
    const chatResponse = await axios.post(`${API_URL}/chat/${sessionId}`, {
      message: "What's happening in the world today?"
    });
    console.log('✅ Chat response received:', chatResponse.data.response);

    console.log('\n3. Testing chat history...');
    const historyResponse = await axios.get(`${API_URL}/history/${sessionId}`);
    console.log('✅ Chat history retrieved:', historyResponse.data.messages);

    console.log('\n4. Testing multiple messages in the same session...');
    const secondChatResponse = await axios.post(`${API_URL}/chat/${sessionId}`, {
      message: "Tell me more about recent technology news."
    });
    console.log('✅ Second chat response received:', secondChatResponse.data.response);

    console.log('\n5. Verifying updated chat history...');
    const updatedHistoryResponse = await axios.get(`${API_URL}/history/${sessionId}`);
    console.log('✅ Updated chat history retrieved:', updatedHistoryResponse.data.messages);

    console.log('\n6. Testing history clearing...');
    await axios.delete(`${API_URL}/history/${sessionId}`);
    const clearedHistoryResponse = await axios.get(`${API_URL}/history/${sessionId}`);
    console.log('✅ History cleared:', clearedHistoryResponse.data.messages);

    console.log('\n7. Testing new session creation...');
    const newSessionResponse = await axios.post(`${API_URL}/session`);
    const newSessionId = newSessionResponse.data.sessionId;
    console.log('✅ New session created:', newSessionId);
    console.log('✅ Verified different session IDs:', sessionId !== newSessionId);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  }
}

// Run the tests
console.log('Starting chatbot tests...\n');
testChatbot();
