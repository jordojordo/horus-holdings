<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ToastManager } from "@kong/kongponents";

import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { isLoading, user, fetchUser, updateProfile, deleteUser } = useAuthStore();
const toaster = new ToastManager();

const username = ref<string | undefined>(user?.Username || undefined);
const newPassword = ref<string>();
const confirmedPassword = ref<string>();

onMounted(async () => {
  if (!user?.Username) {
    const res = await fetchUser()

    username.value = res?.data?.username;
  }
})

onBeforeUnmount(() => toaster.destroy());

const handleUpdate = async () => {
  if (!user) {
    return;
  }

  if (!username.value || !newPassword.value) {
    toaster.open({
      appearance: "warning",
      title: "Missing fields",
      message: "Username and password are required."
    });

    return;
  }

  if (newPassword.value !== confirmedPassword.value) {
    toaster.open({
      appearance: "danger",
      title: "Passwords do not match",
      message: "Please ensure both password fields are identical."
    });

    return;
  }

  try {
    await updateProfile(username.value, newPassword.value);

    toaster.open({
      appearance: "success",
      title: "Profile updated",
      message: "Your profile changes have been saved."
    });

    newPassword.value = undefined;
    confirmedPassword.value = undefined;
  } catch (error: any) {
    toaster.open({
      appearance: "danger",
      title: "Unable to update profile",
      message: error ?? "Please try again."
    });
  }
};

const handleDelete = async () => {
  try {
    if (!user) {
      return;
    }

    await deleteUser();

    toaster.open({
      appearance: "success",
      title: "Account deleted",
      message: "Your account has been removed."
    });

    router.push({ name: "home" });
  } catch (error: any) {
    toaster.open({
      appearance: "danger",
      title: "Unable to delete account",
      message: error ?? "Please try again."
    });
  }
};
</script>

<template>
  <div>
    <h2>Settings</h2>
    <div v-if="isLoading">
      <KSkeleton type="form" />
    </div>
    <div v-else class="settings-form">
      <KInput v-model="username" type="string" label="Username" required />
      <KInput v-model="newPassword" type="password" label="New password" required />
      <KInput v-model="confirmedPassword" type="password" label="Confirm password" required />
      <KButton class="btn text-bold mt-6" :disabled="!username || !newPassword || !confirmedPassword" @click="handleUpdate">Update Profile</KButton>

      <div class="divider" />

      <KButton class="btn btn-danger text-bold" @click="handleDelete"> Delete Account </KButton>
    </div>
  </div>
</template>

<style scoped>
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
</style>
