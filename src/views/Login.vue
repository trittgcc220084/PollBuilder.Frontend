<!-- [FRONTEND] File: src/views/Login.vue -->
<template>
  <div style="max-width: 400px; margin: 50px auto; padding: 24px; background: #1e293b; border-radius: 12px; color: white; font-family: sans-serif;">
    <h2 style="text-align: center; margin-bottom: 24px;">Đăng nhập</h2>
    
    <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <label style="display: block; font-size: 14px; margin-bottom: 6px;">Email</label>
        <input v-model="email" type="email" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; box-sizing: border-box;" />
      </div>

      <div>
        <label style="display: block; font-size: 14px; margin-bottom: 6px;">Mật khẩu</label>
        <input v-model="password" type="password" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; box-sizing: border-box;" />
      </div>

      <button type="submit" :disabled="loading" style="padding: 12px; border-radius: 6px; border: none; background: #3b82f6; color: white; font-weight: bold; cursor: pointer;">
        {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
      </button>
    </form>

    <!-- Hiển thị lỗi rõ ràng ngay tại đây -->
    <p v-if="error" style="color: #f87171; margin-top: 16px; font-size: 14px; text-align: center; background: #f8717122; border: 1px solid #ef4444; padding: 10px; border-radius: 6px;">
      {{ error }}
    </p>

    <p style="text-align: center; margin-top: 16px; font-size: 14px; color: #94a3b8;">
      Chưa có tài khoản? <router-link to="/register" style="color: #38bdf8;">Đăng ký ngay</router-link>
    </p>
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