<template>
  <div id="app">
    <!-- Thanh điều hướng (Navbar) -->
    <nav style="display: flex; gap: 15px; padding: 15px; background-color: #1f2937; color: white; margin-bottom: 20px;">
      
      <!-- Nếu ĐÃ đăng nhập -->
      <template v-if="token">
        <router-link to="/" style="color: white; text-decoration: none;">➕ Tạo Poll</router-link>
        <router-link to="/my-polls" style="color: white; text-decoration: none;">📋 Lịch sử của tôi</router-link>
        
        <div style="margin-left: auto;">
          <span style="margin-right: 15px;">Xin chào, <strong>{{ user?.email }}</strong></span>
          <button @click="logout" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Đăng xuất
          </button>
        </div>
      </template>

      <!-- Nếu CHƯA đăng nhập -->
      <template v-else>
        <router-link to="/login" style="margin-left: auto; color: white; text-decoration: none;">Đăng nhập</router-link>
        <router-link to="/register" style="color: white; text-decoration: none;">Đăng ký</router-link>
      </template>
    </nav>

    <!-- Nội dung các trang sẽ hiển thị ở đây -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useAuth } from './composables/useAuth';

const { user, token, logout } = useAuth();
</script>

<style>
/* CSS Reset cơ bản để giao diện đẹp hơn */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f9fafb;
}
</style>
