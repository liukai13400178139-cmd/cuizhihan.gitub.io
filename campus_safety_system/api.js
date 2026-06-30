const API_BASE_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

function getUserInfo() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function setUserInfo(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function removeUserInfo() {
  localStorage.removeItem('user');
}

async function apiGet(url, params = {}) {
  const token = getToken();
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${API_BASE_URL}${url}?${queryString}` : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

async function apiPost(url, data = {}) {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
}

async function apiPut(url, data = {}) {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PUT',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
}

async function apiDelete(url) {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

function checkLogin() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  removeToken();
  removeUserInfo();
  window.location.href = 'login.html';
}
