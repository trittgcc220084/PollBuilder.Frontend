<template>
  <div id="app">
<!-- Navigation Bar (Navbar) -->
     <nav style="display: flex; gap: 15px; padding: 15px; background-color: #1f2937; color: white; margin-bottom: 20px;">
      
      <template v-if="token">
        <router-link to="/" style="color: white; text-decoration: none;">➕ Create Poll</router-link>
        <router-link to="/my-polls" style="color: white; text-decoration: none;">📋 My Polls</router-link>
        
        <div style="margin-left: auto;">
          <span style="margin-right: 15px;">Hello, <strong>{{ user?.email }}</strong></span>
          <button @click="logout" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Logout
          </button>
        </div>
      </template>

      <template v-else>
        <router-link to="/login" style="margin-left: auto; color: white; text-decoration: none;">Log in</router-link>
        <router-link to="/register" style="color: white; text-decoration: none;">Register</router-link>
      </template>
    </nav>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { useAuth } from './composables/useAuth';

const { user, token, logout } = useAuth();
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f9fafb;
}
</style>
