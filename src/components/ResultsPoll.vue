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
let pollingTimer = null

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pollbuildergateway.onrender.com'
// Kết nối SignalR đi thẳng tới RealtimeService, KHÔNG qua Gateway
// (Ocelot chưa có route cho /hubs/polls, và proxy WebSocket qua nhiều lớp dễ bị ngắt trên free tier)
const realtimeBaseUrl = import.meta.env.VITE_REALTIME_URL || 'https://pollbuilder-realtime-s3ye.onrender.com'
const hubUrl = `${realtimeBaseUrl.replace(/\/$/, '')}/hubs/polls`

async function resyncResults() {
  try {
    const fresh = await pollApi.results(code)
    results.value = fresh
  } catch (e) {
    // Nếu poll đã bị xoá/đóng và không còn quyền xem thì bỏ qua, không ghi đè lỗi hiện tại
    console.error('Lỗi resync:', e.message)
  }
}

onMounted(async () => {
  try {
    results.value = await pollApi.results(code)
  } catch (e) {
    error.value = e.message
    loading.value = false
    return // ← DỪNG LẠI NGAY, KHÔNG kết nối SignalR nếu không có quyền xem
  }

  loading.value = false

  // LỚP DỰ PHÒNG: tự động đồng bộ lại mỗi 4 giây bằng REST API
  // Vì WebSocket trên Render free tier hay bị ngắt (~10-15s/lần), không thể chỉ tin tưởng SignalR
  pollingTimer = setInterval(() => {
    if (results.value?.status !== 'closed') {
      resyncResults()
    }
  }, 4000)

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

  // SignalR tự kết nối lại (reconnect) nhưng KHÔNG tự join lại group
  // -> phải tự JoinPoll lại + đồng bộ lại dữ liệu (bù phần có thể đã bị lỡ lúc mất kết nối)
  connection.onreconnected(async () => {
    try {
      await connection.invoke('JoinPoll', code)
      await resyncResults()
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
  if (pollingTimer) clearInterval(pollingTimer)
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