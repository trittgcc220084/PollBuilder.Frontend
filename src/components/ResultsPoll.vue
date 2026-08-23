<template>
  <div>
    <div v-if="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="results">
      <h2>{{ results.question }}</h2>
      <p>
        Tổng vote: <strong>{{ results.totalVotes }}</strong>
        · Trạng thái: <strong>{{ results.status }}</strong>
      </p>

      <PollChart :options="results.options" :counts="results.counts" />

      <div style="margin-top:1.5rem; display:flex; gap:1rem">
        <router-link :to="`/poll/${code}`" class="btn">Đi vote</router-link>
        <button v-if="results.status === 'open'" @click="closePoll" style="background:#ef4444">
          Đóng poll
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import * as signalR from '@microsoft/signalr'
import { pollApi } from '../api/pollApi'
import PollChart from './PollChart.vue'

const route = useRoute()
const code = route.params.code

const results = ref(null)
const loading = ref(true)
const error = ref('')
let connection = null

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pollbuildergateway.onrender.com'
// Kết nối SignalR đi thẳng tới RealtimeService, KHÔNG qua Gateway
// (Ocelot chưa có route cho /hubs/polls, và proxy WebSocket qua nhiều lớp dễ bị ngắt trên free tier)
const realtimeBaseUrl = import.meta.env.VITE_REALTIME_URL || 'https://pollbuilder-realtime-s3ye.onrender.com'
const hubUrl = `${realtimeBaseUrl.replace(/\/$/, '')}/hubs/polls`

onMounted(async () => {
  try {
    results.value = await pollApi.results(code)
  } catch (e) {
    error.value = e.message
    loading.value = false
    return // ← DỪNG LẠI NGAY, KHÔNG kết nối SignalR nếu không có quyền xem
  }

  loading.value = false

  // Khởi tạo kết nối SignalR sử dụng đường dẫn Hub động
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => {
        let token = localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
        return token.replace(/^"(.*)"$/, '$1').trim()
      }
    })
    .withAutomaticReconnect()
    .build()

  connection.on('VoteReceived', (newResults) => {
    results.value = newResults
  })

  connection.on('PollClosed', () => {
    if (results.value) results.value.status = 'closed'
  })

  // QUAN TRỌNG: SignalR tự kết nối lại (reconnect) nhưng KHÔNG tự join lại group
  // Trên Render free tier, WebSocket bị ngắt định kỳ -> phải tự JoinPoll lại mỗi khi reconnect
  connection.onreconnected(async () => {
    try {
      await connection.invoke('JoinPoll', code)
      console.log('✅ Đã join lại group sau khi reconnect')
    } catch (e) {
      console.error('Lỗi khi join lại group:', e)
    }
  })

  try {
    await connection.start()
    await connection.invoke('JoinPoll', code)
  } catch (e) {
    console.error('SignalR error', e)
  }
})

onUnmounted(() => {
  if (connection) connection.stop()
})

async function closePoll() {
  try {
    await pollApi.close(code)
    results.value.status = 'closed'
  } catch (e) {
    alert(e.message)
  }
}
</script>