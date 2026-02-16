import { defineStore } from 'pinia'
import type { CartItem, SavedList } from '#shared/types/lists'

const SAVE_FEEDBACK_MS = 1200

const ERROR_MESSAGES = {
  duplicateName: 'A list with that name already exists. Choose another.',
  saveFailed: 'Could not save the list. Please try again.',
  deleteFailed: 'Could not delete this list.'
} as const

// Converts a low-level storage write result into a user-facing message.
// Duplicate-name gets a specific message; everything else uses the provided fallback.
const mapWriteResultToError = (result: SavedListWriteResult, fallback: string) => {
  if (result.ok) return null
  return result.reason === 'duplicate_name' ? ERROR_MESSAGES.duplicateName : fallback
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    // Saved lists dataset displayed on /lists page.
    savedLists: [] as SavedList[],
    // Async state for fetching/deleting saved lists.
    loading: false,
    error: null as string | null,
    // Save flow feedback state used by SaveListModal and Save button UI.
    justSaved: false,
    lastSavedName: null as string | null,
    lastSaveError: null as string | null
  }),

  actions: {
    // Triggers the temporary "Saved" visual state.
    triggerSavedFeedback() {
      this.justSaved = true
      setTimeout(() => {
        this.justSaved = false
      }, SAVE_FEEDBACK_MS)
    },

    // Clears the last save error before opening/closing save modal.
    clearSaveError() {
      this.lastSaveError = null
    },

    // Loads all saved lists from storage into store state.
    // This is the single entry point for refreshing the /lists data view.
    async fetchSavedLists() {
      this.loading = true
      this.error = null

      try {
        this.savedLists = getSavedLists() as SavedList[]
      } catch {
        this.error = 'Could not load saved lists.'
      } finally {
        this.loading = false
      }
    },

    // Saves the current shopping-list items under a user-provided name.
    // Returns false for invalid/duplicate/storage errors and sets lastSaveError.
    saveListFromItems(name: string, items: CartItem[]) {
      const trimmed = name.trim()
      if (!trimmed) return false

      const result = saveNamedList(trimmed, items as unknown[])
      if (!result.ok) {
        this.lastSaveError = mapWriteResultToError(result, ERROR_MESSAGES.saveFailed)
        return false
      }

      this.lastSavedName = trimmed
      this.lastSaveError = null
      this.triggerSavedFeedback()
      return true
    },

    // Reads one saved list by name from storage.
    // Used when the user clicks a card to load it into the current shopping list.
    findSavedList(name: string) {
      const list = loadSavedListByName(name)
      if (!list || !Array.isArray(list.items)) return null
      return list as SavedList
    },

    // Deletes one saved list by name, then refreshes store state.
    // Keeps /lists UI in sync after deletion.
    async deleteSavedList(name: string) {
      this.error = null

      try {
        const ok = deleteSavedListByName(name)
        if (!ok) {
          this.error = ERROR_MESSAGES.deleteFailed
          return false
        }

        await this.fetchSavedLists()
        return true
      } catch {
        this.error = ERROR_MESSAGES.deleteFailed
        return false
      }
    }
  }
})
