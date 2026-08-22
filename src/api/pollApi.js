// [FRONTEND] File: src/api/pollApi.js

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pollbuildergateway.onrender.com'
const API_BASE = `${rawBaseUrl.replace(/\/$/, '')}/api`

async function request(url, options = {}) {
  let token = localStorage.getItem('token') || localStorage.getItem('accessToken')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Tự động làm sạch và đính kèm Token
  if (token) {
    token = token.replace(/^"(.*)"$/, '$1').trim()
    
    if (token.startsWith('Bearer ')) {
      token = token.substring(7)
    }

    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.warn('⚠️ [CHECK TOKEN]: Không tìm thấy Token trong LocalStorage.')
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    // Đã bỏ 'credentials: include' để tránh bị trình duyệt chặn CORS Preflight
  })

  if (!res.ok) {
    const errorBody = await res.text()
    let err = {}
    try {
      err = errorBody ? JSON.parse(errorBody) : {}
    } catch {
      err = { message: errorBody }
    }
    throw new Error(err.message || err.error || `Lỗi HTTP ${res.status}`)
  }

  const responseBody = await res.text()
  return responseBody ? JSON.parse(responseBody) : null
}

export const pollApi = {
  create(question, options) {
    return request('/polls', {
      method: 'POST',
      body: JSON.stringify({ 
        title: question,    // C# Backend thường đặt tên thuộc tính DTO là Title
        question: question, // Gửi kèm cả 2 trường để khớp 100% với DTO Backend
        options 
      }),
    })
  },
  get(code) {
    return request(`/polls/${code}`)
  },
  results(code) {
    return request(`/polls/${code}/results`)
  },
  vote(code, optionIndex) {
    return request('/votes', {
      method: 'POST',
      body: JSON.stringify({ pollCode: code, optionIndex }),
    })
  },
  close(code) {
    return request(`/polls/${code}/close`, {
      method: 'PATCH',
    })
  },
  getMyPolls() {
    return request('/polls/my-polls')
  }
}
