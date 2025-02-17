// stores/authStore.js
import { defineStore } from 'pinia'
import { TasksService } from '@/api/tasks';

export const useLandingStore = defineStore('landing', {
    state: () => ({
        task: null,
        tasks_test: [],
    }),
    actions: {

        async getTaskByIsTest() {
            if (this.task) return;

            const data = await TasksService.getTaskByIsTest()

            if (!data) return;

            this.tasks_test = data
        },

        selectProduct(task) {
            if (!task) return;

            sessionStorage.setItem("user-task", JSON.stringify(task))

            window.location.href = "/compare"
        }

    }
})