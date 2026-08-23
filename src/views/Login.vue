<!-- [FRONTEND] File: src/views/Login.vue -->
<template>
  <div class="auth-page">
    <div class="card auth-card fade-in">
      <div class="eyebrow">Poll Builder</div>
      <h2 class="auth-title">Log in</h2>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" required class="input" placeholder="ban@vidu.com" />
        </div>

        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" required class="input" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary btn-block">
          <span v-if="loading" class="btn-loader"></span>
          {{ loading ? 'Processing...' : 'Log in' }}
        </button>
      </form>

      <div v-if="error" class="error-message">
        <span class="error-icon">!</span>
        <span>{{ error }}</span>
      </div>

      <p class="auth-footer">
        Don't have an account? <router-link to="/register" class="link">Sign up now</router-link>
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
      error.value = 'Server does not return a token!'
    }
  } catch (err) {
    console.error('Login Error:', err)
    error.value = err.response?.data?.message || err.message || 'Cannot connect to the server'
  } finally {
    loading.value = false
  }
}
</script>