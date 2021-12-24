<template>
  <div v-if="user">Hey {{ user }}</div>

  <div v-else>Login with <a href="/discord/redirect"> Discord </a></div>
</template>

<script setup>
defineProps({
  user: {
    type: [Object, null],
    required: true,
  },
});
import Counter from "./Counter.vue";
</script>
