<template>
  <div class="page create-poll-page">
    <div class="container">
      <div class="create-poll-card card fade-in">
        <!-- Header -->
        <div class="create-poll-header">
          <div class="eyebrow">CREATE A NEW POLL</div>
          <h1 class="page-title">Poll Builder</h1>
          <p class="page-subtitle">
            Create a poll and share it with others in seconds.
          </p>
        </div>

        <!-- Question -->
        <div class="form-group">
          <label class="form-label">Question</label>
          <input
            v-model="question"
            type="text"
            class="input"
            placeholder="What is your favorite color?"
            maxlength="200"
            :disabled="loading"
          />
        </div>

        <!-- Options -->
        <div class="form-group">
          <label class="form-label">
            Options
            <span class="form-hint">(2–6 options)</span>
          </label>

          <div class="options-list">
            <div
              v-for="(opt, i) in options"
              :key="i"
              class="option-row"
            >
              <div class="option-number">{{ i + 1 }}</div>

              <input
                v-model="options[i]"
                type="text"
                class="input option-input"
                :placeholder="'Option ' + (i + 1)"
                maxlength="100"
                :disabled="loading"
              />

              <button
                v-if="options.length > 2"
                type="button"
                class="remove-option-btn"
                title="Remove option"
                :disabled="loading"
                @click="removeOption(i)"
              >
                ×
              </button>
            </div>
          </div>

          <button
            v-if="options.length < 6"
            type="button"
            class="add-option-btn"
            :disabled="loading"
            @click="addOption"
          >
            <span>+</span>
            Add Option
          </button>
        </div>

        <!-- Create Button -->
        <button
          type="button"
          class="btn btn-primary create-btn"
          :disabled="loading"
          @click="createPoll"
        >
          <span v-if="loading" class="btn-loader"></span>
          {{ loading ? 'Creating Poll...' : 'Create Poll' }}
        </button>

        <!-- Error -->
        <div v-if="error" class="error-message">
          <span class="error-icon">!</span>
          <span>{{ error }}</span>
        </div>

        <!-- Success -->
        <div v-if="created" class="success-card fade-in">
          <div class="success-header">
            <div class="success-icon">✓</div>
            <div>
              <h3>Poll Created Successfully!</h3>
              <p>Your poll is ready to be shared.</p>
            </div>
          </div>

          <div class="poll-info">
            <div class="poll-info-row">
              <span class="info-label">Poll Code</span>
              <strong class="poll-code-value">{{ created.code }}</strong>
            </div>

            <div class="poll-link-box">
              <span class="info-label">Voting Link</span>
              <router-link
                :to="'/poll/' + created.code"
                class="poll-link"
              >
                {{ origin }}/poll/{{ created.code }}
              </router-link>
            </div>
          </div>

          <router-link
            :to="'/poll/' + created.code"
            class="btn btn-primary vote-now-btn"
          >
            Vote Now
            <span>→</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { pollApi } from '../api/pollApi'

const question = ref('')
const options = ref(['', ''])
const loading = ref(false)
const error = ref('')
const created = ref(null)
const origin = window.location.origin

function addOption() {
  if (options.value.length < 6) {
    options.value.push('')
  }
}

function removeOption(index) {
  if (options.value.length > 2) {
    options.value.splice(index, 1)
  }
}

async function createPoll() {
  error.value = ''
  created.value = null

  const cleanQuestion = question.value.trim()
  const cleanOptions = options.value
    .map(o => o.trim())
    .filter(Boolean)

  // Validation
  if (!cleanQuestion) {
    error.value = 'Please enter a question'
    return
  }

  if (cleanOptions.length < 2) {
    error.value = 'Please enter at least 2 options'
    return
  }

  if (cleanOptions.length > 6) {
    error.value = 'Maximum 6 options allowed'
    return
  }

  // Chặn option trùng (không phân biệt hoa thường)
  const uniqueSet = new Set(cleanOptions.map(o => o.toLowerCase()))
  if (uniqueSet.size !== cleanOptions.length) {
    error.value = 'Options must not be duplicated'
    return
  }

  loading.value = true

  try {
    created.value = await pollApi.create(cleanQuestion, cleanOptions)
  } catch (e) {
    error.value = e.message || 'Error creating poll'
  } finally {
    loading.value = false
  }
}
</script>
