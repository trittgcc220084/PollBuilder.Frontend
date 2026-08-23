<template>
  <div class="auth-page">
    <div class="card auth-card fade-in">
      <div class="eyebrow">Poll Builder</div>
      <h2 class="auth-title">Register</h2>

      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Email -->
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="input"
            placeholder="you@example.com"
            :disabled="isLoading"
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="input"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            class="input"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <!-- Account Confirmation -->
        <div class="form-group confirm-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="agreeTerms"
              required
              :disabled="isLoading"
            />
            <span>I confirm that the information above is correct and I want to create an account</span>
          </label>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="btn-loader"></span>
          {{ isLoading ? 'Processing...' : 'Register' }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">
        <span class="error-icon">!</span>
        <span>{{ errorMessage }}</span>
      </div>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login" class="link">Log in</router-link>
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
const confirmPassword = ref('')
const agreeTerms = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pollbuildergateway.onrender.com'

async function handleRegister() {
  errorMessage.value = ''

  // Validate Confirm Password
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password and Confirm Password do not match.'
    return
  }

  // Validate Account Confirmation
  if (!agreeTerms.value) {
    errorMessage.value = 'Please confirm that you want to create an account.'
    return
  }

  isLoading.value = true

  try {
    const response = await axios.post(
      `${apiBaseUrl.replace(/\/$/, '')}/api/auth/register`,
      {
        email: email.value.trim(),
        password: password.value
      }
    )

    const token = response.data?.token || response.data?.Token
    if (token) {
      login(token)
    }

    // Sau đăng ký thành công → vào thẳng trang tạo poll
    router.push(route.query.redirect || '/create')
  } catch (error) {
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message

    errorMessage.value =
      typeof serverMessage === 'string'
        ? serverMessage
        : 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.confirm-group {
  margin-top: 8px;
  margin-bottom: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  line-height: 1.4;
}

.checkbox-label input {
  margin-top: 3px;
  flex-shrink: 0;
}
</style>
