<!-- [FRONTEND] File: src/views/Register.vue -->
<template>
  <div style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #1e293b; color: white;">
    <h2>Đăng ký tài khoản</h2>
    <form @submit.prevent="handleRegister">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Email</label>
        <input v-model="email" type="email" required style="width: 100%; padding: 8px; border: 1px solid #334155; border-radius: 4px; background: #0f172a; color: white; box-sizing: border-box;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Mật khẩu</label>
        <input v-model="password" type="password" required style="width: 100%; padding: 8px; border: 1px solid #334155; border-radius: 4px; background: #0f172a; color: white; box-sizing: border-box;" />
      </div>
      <button type="submit" :disabled="isLoading" style="width: 100%; padding: 10px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
        {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
      </button>
    </form>

    <!-- Hiển thị lỗi ngay giao diện, không xài popup alert() -->
    <p v-if="errorMessage" style="color: #f87171; margin-top: 15px; text-align: center; background: #f8717122; border: 1px solid #ef4444; padding: 8px; border-radius: 4px; font-size: 14px;">
      {{ errorMessage }}
    </p>

    <p style="margin-top: 15px; text-align: center; font-size: 14px; color: #94a3b8;">
      Đã có tài khoản? <router-link to="/login" style="color: #38bdf8;">Đăng nhập</router-link>
    </p>
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
    // Bắt đúng chuỗi tin nhắn lỗi từ Backend trả về
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    errorMessage.value = typeof serverMessage === 'string' ? serverMessage : (error.message || 'Đăng ký thất bại.');
  } finally {
    isLoading.value = false;
  }
};
</script>