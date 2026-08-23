<!-- [FRONTEND] File: src/views/Login.vue -->
<template>
  <div class="auth-page">
    <div class="card auth-card fade-in">
      <div class="eyebrow">Poll Builder</div>
      <h2 class="auth-title">Đăng nhập</h2>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" required class="input" placeholder="ban@vidu.com" />
        </div>

        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Mật khẩu</label>
          <input v-model="password" type="password" required class="input" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary btn-block">
          <span v-if="loading" class="btn-loader"></span>
          {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </button>
      </form>

      <div v-if="error" class="error-message">
        <span class="error-icon">!</span>
        <span>{{ error }}</span>
      </div>

      <p class="auth-footer">
        Chưa có tài khoản? <router-link to="/register" class="link">Đăng ký ngay</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const route = useRoute()
const { login } = useAuth()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pollbuildergateway.onrender.com'

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await axios.post(`${apiBaseUrl.replace(/\/$/, '')}/api/auth/login`, {
      email: email.value,
      password: password.value
    })

    const token = res.data?.token || res.data?.Token

    if (token) {
      login(token)
      router.push(route.query.redirect || '/')
    } else {
      error.value = 'Server không trả về Token!'
    }
  } catch (err) {
    console.error('Lỗi Login:', err)
    error.value = err.response?.data?.message || err.message || 'Không thể kết nối đến Server'
  } finally {
    loading.value = false
  }
}
</script>