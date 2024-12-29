const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Common API configuration
const OC = process.env.OC;
const defaultParams = {
  OC,
  type: "JSON"
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 법률 검색 API
app.get('/api/law/search', async (req, res) => {
  try {
    const { query, OC: oc, type = 'JSON' } = req.query;
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params: {
        target: 'law',
        display: '100',
        query: encodeURIComponent(query),
        OC: oc,
        type
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 법률 상세 정보 API
app.get('/api/law/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { OC: oc, type = 'JSON' } = req.query;
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params: {
        target: 'law',
        ID: id,
        OC: oc,
        type
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 판례 검색 API
app.get('/api/precedent/search', async (req, res) => {
  try {
    const { query, page, OC: oc, type = 'JSON' } = req.query;
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params: {
        target: 'prec',
        org: '400201',
        display: '100',
        query: encodeURIComponent(query),
        page,
        OC: oc,
        type
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 판례 상세 정보 API
app.get('/api/precedent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { OC: oc, type = 'JSON' } = req.query;
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params: {
        target: 'prec',
        ID: id,
        OC: oc,
        type
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 법령해석 검색 API
app.get('/api/interpretation/search', async (req, res) => {
  try {
    const { query, page, OC: oc, type = 'JSON' } = req.query;
    const response = await axios.get('http://www.law.go.kr/DRF/lawSearch.do', {
      params: {
        target: 'expc',
        display: '100',
        query: encodeURIComponent(query),
        page,
        OC: oc,
        type
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 법령해석 상세 정보 API
app.get('/api/interpretation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { OC: oc, type = 'JSON' } = req.query;
    const response = await axios.get('http://www.law.go.kr/DRF/lawService.do', {
      params: {
        target: 'expc',
        ID: id,
        OC: oc,
        type
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
