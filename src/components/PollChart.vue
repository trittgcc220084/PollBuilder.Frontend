<template>
  <div class="chart">
    <div v-for="opt in options" :key="opt.index" class="chart-row">
      <div class="chart-row-top">
        <span class="chart-row-label">{{ opt.text }}</span>
        <span class="chart-row-value">{{ counts?.[opt.index] ?? 0 }} vote · {{ percent(opt.index) }}%</span>
      </div>
      <div class="chart-track">
        <div class="chart-fill" :style="{ width: percent(opt.index) + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: { type: Array, required: true },
  counts: { type: Object, default: () => ({}) },
})

function percent(index) {
  const values = Object.values(props.counts || {})
  const total = values.reduce((sum, v) => sum + v, 0)
  if (!total) return 0
  const count = props.counts?.[index] ?? 0
  return Math.round((count / total) * 100)
}
</script>