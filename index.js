const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API 키 확인
if (!process.env.OC) {
  console.error('Error: OC environment variable is not set');
  process.exit(1);
}

// Common API configuration
const OC = process.env.OC;
console.log('Using OC:', OC); // 환경변수 확인용 로그

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', OC: OC ? 'set' : 'not set' });
});

// 법률 검색 API
app.get('/api/law/search', async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Searching law with query:', query);
    
    const params = {
      target: 'law',
      display: '100',
      query: encodeURIComponent(query),
      OC: process.env.OC,
      type: 'JSON'
    };
    
    console.log('Request params:', params);
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params: params
    });
    
    if (response.data.includes('사용자인증에 실패하였습니다') || response.data.includes('페이지 접속에 실패하였습니다')) {
      console.error('API Authentication failed');
      return res.status(401).json({ 
        error: 'API Authentication failed',
        message: 'Invalid OC key or API access denied',
        ocKey: process.env.OC ? 'present' : 'missing'
      });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      OC: process.env.OC ? 'present' : 'missing'
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ocKey: process.env.OC ? 'present' : 'missing'
    });
  }
});

// 법률 상세 정보 API
app.get('/api/law/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting law details with id:', id);
    
    const params = {
      target: 'law',
      ID: id,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    console.log('Request params:', params);
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params: params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log('Response type:', typeof response.data);
    console.log('Response:', response.data);

    // 응답이 HTML인 경우
    if (typeof response.data === 'string') {
      if (response.data.includes('사용자인증에 실패하였습니다') || 
          response.data.includes('페이지 접속에 실패하였습니다')) {
        console.error('API Authentication failed');
        return res.status(401).json({ 
          error: 'API Authentication failed',
          message: 'IP-based authentication may be required',
          serverIP: '54.254.162.138'
        });
      }
      // HTML이 아닌 다른 문자열 응답
      try {
        const jsonData = JSON.parse(response.data);
        return res.json(jsonData);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return res.status(500).json({
          error: 'Invalid response format',
          data: response.data.substring(0, 200)
        });
      }
    }
    
    // JSON 응답
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      OC: process.env.OC ? 'present' : 'missing',
      headers: error.response?.headers
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: error.response?.data,
      ocKey: process.env.OC ? 'present' : 'missing'
    });
  }
});

// 판례 검색 API
app.get('/api/precedent/search', async (req, res) => {
  try {
    const { query, page } = req.query;
    console.log('Searching precedent with query:', query, 'and page:', page);
    
    const params = {
      target: 'prec',
      org: '400201',
      display: '100',
      query: query ? encodeURIComponent(query) : undefined,
      page,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    console.log('Request params:', params);
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params: params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log('Response type:', typeof response.data);
    console.log('Response:', response.data);

    // 응답이 문자열인 경우
    if (typeof response.data === 'string') {
      if (response.data.includes('사용자인증에 실패하였습니다') || 
          response.data.includes('페이지 접속에 실패하였습니다')) {
        console.error('API Authentication failed');
        return res.status(401).json({ 
          error: 'API Authentication failed',
          message: 'IP-based authentication may be required',
          serverIP: '54.254.162.138'
        });
      }
      // 문자열을 JSON으로 파싱 시도
      try {
        const jsonData = JSON.parse(response.data);
        return res.json(jsonData);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return res.status(500).json({
          error: 'Invalid response format',
          data: response.data.substring(0, 200)
        });
      }
    }
    
    // JSON 응답
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      OC: process.env.OC ? 'present' : 'missing',
      headers: error.response?.headers
    });
    
    if (error.response?.data) {
      console.log('Full error response:', error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: error.response?.data,
      ocKey: process.env.OC ? 'present' : 'missing'
    });
  }
});

// 판례 상세 정보 API
app.get('/api/precedent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting precedent details with id:', id);
    
    const params = {
      target: 'prec',
      ID: id,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    console.log('Request params:', params);
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params: params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log('Response type:', typeof response.data);
    console.log('Response:', response.data);

    // 응답이 문자열인 경우
    if (typeof response.data === 'string') {
      if (response.data.includes('사용자인증에 실패하였습니다') || 
          response.data.includes('페이지 접속에 실패하였습니다')) {
        console.error('API Authentication failed');
        return res.status(401).json({ 
          error: 'API Authentication failed',
          message: 'IP-based authentication may be required',
          serverIP: '54.254.162.138'
        });
      }
      // 문자열을 JSON으로 파싱 시도
      try {
        const jsonData = JSON.parse(response.data);
        return res.json(jsonData);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return res.status(500).json({
          error: 'Invalid response format',
          data: response.data.substring(0, 200)
        });
      }
    }
    
    // JSON 응답
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      OC: process.env.OC ? 'present' : 'missing',
      headers: error.response?.headers
    });
    
    if (error.response?.data) {
      console.log('Full error response:', error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: error.response?.data,
      ocKey: process.env.OC ? 'present' : 'missing'
    });
  }
});

// 법령해석 검색 API
app.get('/api/interpretation/search', async (req, res) => {
  try {
    const { query, page } = req.query;
    console.log('Searching interpretation with query:', query, 'and page:', page);
    
    const params = {
      target: 'expc',
      display: '100',
      query: query ? encodeURIComponent(query) : undefined,
      page,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    console.log('Request params:', params);
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params: params
    });
    
    if (response.data.includes('사용자인증에 실패하였습니다') || response.data.includes('페이지 접속에 실패하였습니다')) {
      console.error('API Authentication failed');
      return res.status(401).json({ 
        error: 'API Authentication failed',
        message: 'Invalid OC key or API access denied',
        ocKey: process.env.OC ? 'present' : 'missing'
      });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      OC: process.env.OC ? 'present' : 'missing'
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ocKey: process.env.OC ? 'present' : 'missing'
    });
  }
});

// 법령해석 상세 정보 API
app.get('/api/interpretation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting interpretation details with id:', id);
    
    const params = {
      target: 'expc',
      ID: id,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    console.log('Request params:', params);
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params: params
    });
    
    if (response.data.includes('사용자인증에 실패하였습니다') || response.data.includes('페이지 접속에 실패하였습니다')) {
      console.error('API Authentication failed');
      return res.status(401).json({ 
        error: 'API Authentication failed',
        message: 'Invalid OC key or API access denied',
        ocKey: process.env.OC ? 'present' : 'missing'
      });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      OC: process.env.OC ? 'present' : 'missing'
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ocKey: process.env.OC ? 'present' : 'missing'
    });
  }
});

// IP 확인 엔드포인트
app.get('/ip', async (req, res) => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    res.json({
      serverIP: response.data.ip,
      clientIP: req.ip,
      headers: req.headers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get IP' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
