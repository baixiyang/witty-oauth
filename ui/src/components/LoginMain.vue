<template>
  <NForm
    size="large"
    class="login"
    ref="form"
    :model="model"
    labelPlacement="left"
    :rules="rules"
  >
    <div class="login-title">Login</div>
    <NFormItem label="username" path="username">
      <NInput v-model:value="model.username" />
    </NFormItem>
    <NFormItem label="password" path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        @keydown.enter="loginHandler"
      />
    </NFormItem>
    <div class="login-button-wrapper">
      <NButton
        style="width: 100%"
        type="default"
        size="large"
        :loading="loading"
        @click="loginHandler"
        >login</NButton
      >
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { login } from '../request';
import { FormInst, FormRules } from 'naive-ui';
const model = reactive<{ username: string; password: string }>({
  username: '',
  password: '',
});
const loading = ref(false);
const form = ref<FormInst>();
const rules: FormRules = {
  username: [
    {
      required: true,
      message: 'username is required',
    },
  ],
  password: [
    {
      required: true,
      message: 'password is required',
    },
  ],
};
async function loginHandler() {
  await form.value?.validate();
  loading.value = true;
  try {
    const { redirect_uri } = await login(model);
    // eslint-disable-next-line no-debugger
    location.href = redirect_uri;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login {
  background: rgb(122, 123, 128);
  border-radius: 8px;
  height: 350px;
  width: 400px;
  box-sizing: border-box;
  padding: 20px 20px;
  //display: flex;
  //flex-direction: column;
  //align-items: center;
  //justify-content: center;
  .login-title {
    margin-bottom: 30px;
    font-size: 30px;
  }
  .login-button-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
