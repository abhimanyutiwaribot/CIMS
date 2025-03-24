import axios from 'axios';

const AI_SERVER_URL = 'http://192.168.0.188:8000';

export const analyzeIssue = async (issueData) => {
  try {
    const response = await axios.post(`${AI_SERVER_URL}/analyze-issue`, {
      text: `${issueData.title} ${issueData.description}`
    });
    
    return response.data;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze issue');
  }
};
