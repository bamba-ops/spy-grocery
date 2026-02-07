export const useStores = () => {
  const fetch = () => {
    return useFetch('/api/stores', {
      key: 'stores'
    })
  }

  return {
    fetch
  }
}
