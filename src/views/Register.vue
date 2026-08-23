<!-- [FRONTEND] File: src/views/Register.vue -->
<template>
  <div class="auth-page">
    <div class="card auth-card fade-in">
      <div class="eyebrow">Poll Builder</div>
      <h2 class="auth-title">Register</h2>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" required class="input" placeholder="ban@vidu.com" />
        </div>

        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" required class="input" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="isLoading" class="btn btn-primary btn-block">
          <span v-if="isLoading" class="btn-loader"></span>
          {{ isLoading ? 'Processing...' : 'Register' }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">
        <span class="error-icon">!</span>
        <span>{{ errorMessage }}</span>
      </div>

      <p class="auth-footer">
        Already have an account? <router-link to="/login" class="link">Log in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useAuth } from '../composables/useAuth';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const route = useRoute();
const { login } = useAuth();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pollbuildergateway.onrender.com';

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post(`${apiBaseUrl.replace(/\/$/, '')}/api/auth/register`, {
      email: email.value.trim(),
      password: password.value
    });

    const token = response.data?.token || response.data?.Token;
    if (token) {
      login(token);
    }

    router.push(route.query.redirect || '/');
  } catch (error) {
// Correctly capture the error message string returned by the backend    
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    errorMessage.value = typeof serverMessage === 'string' ? serverMessage : (error.message || 'Registration failed.');
  } finally {
    isLoading.value = false;
  }
};
</script>