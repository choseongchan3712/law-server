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

// 공통 API 설정
const commonHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// 응답 처리 함수
const handleResponse = (response) => {
  console.log('Response type:', typeof response.data);
  
  // 응답이 문자열인 경우
  if (typeof response.data === 'string') {
    if (response.data.includes('사용자인증에 실패하였습니다') || 
        response.data.includes('페이지 접속에 실패하였습니다')) {
      throw {
        status: 401,
        error: 'API Authentication failed',
        message: 'IP-based authentication may be required',
        serverIP: '54.254.162.138'
      };
    }
    // 문자열을 JSON으로 파싱 시도
    try {
      return JSON.parse(response.data);
    } catch (parseError) {
      throw {
        status: 500,
        error: 'Invalid response format',
        data: response.data.substring(0, 200)
      };
    }
  }
  
  return response.data;
};

// 에러 처리 함수
const handleError = (error, res) => {
  console.error('Error details:', {
    message: error.message,
    response: error.response?.data,
    OC: process.env.OC ? 'present' : 'missing',
    headers: error.response?.headers
  });
  
  if (error.status) {
    return res.status(error.status).json(error);
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    details: error.response?.data,
    ocKey: process.env.OC ? 'present' : 'missing'
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', OC: process.env.OC ? 'set' : 'not set' });
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
    handleError(error, res);
  }
});

// 법률 검색 API
app.get('/api/law/search', async (req, res) => {
  try {
    const { query } = req.query;
    const params = {
      target: 'law',
      display: '100',
      query: encodeURIComponent(query),
      OC: process.env.OC,
      type: 'JSON'
    };
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params,
      headers: commonHeaders
    });
    
    res.json(handleResponse(response));
  } catch (error) {
    handleError(error, res);
  }
});

// 법률 상세 정보 API
app.get('/api/law/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      target: 'law',
      ID: id,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params,
      headers: commonHeaders
    });
    
    res.json(handleResponse(response));
  } catch (error) {
    handleError(error, res);
  }
});

// 판례 검색 API
app.get('/api/precedent/search', async (req, res) => {
  try {
    const { query, page } = req.query;
    const params = {
      target: 'prec',
      org: '400201',
      display: '100',
      query: query ? encodeURIComponent(query) : undefined,
      page,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params,
      headers: commonHeaders
    });
    
    res.json(handleResponse(response));
  } catch (error) {
    handleError(error, res);
  }
});

// 판례 상세 정보 API
app.get('/api/precedent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      target: 'prec',
      ID: id,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params,
      headers: commonHeaders
    });
    
    res.json(handleResponse(response));
  } catch (error) {
    handleError(error, res);
  }
});

// 법령해석 검색 API
app.get('/api/interpretation/search', async (req, res) => {
  try {
    const { query, page } = req.query;
    const params = {
      target: 'expc',
      display: '100',
      query: query ? encodeURIComponent(query) : undefined,
      page,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params,
      headers: commonHeaders
    });
    
    res.json(handleResponse(response));
  } catch (error) {
    handleError(error, res);
  }
});

// 법령해석 상세 정보 API
app.get('/api/interpretation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      target: 'expc',
      ID: id,
      OC: process.env.OC,
      type: 'JSON'
    };
    
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params,
      headers: commonHeaders
    });
    
    res.json(handleResponse(response));
  } catch (error) {
    handleError(error, res);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
