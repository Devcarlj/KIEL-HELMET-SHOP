import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './route/index'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { SWRConfig } from 'swr'
import fetcher from './utils/fetcher.js'

console.log('Rendering main.jsx');
createRoot(document.getElementById('root')).render(
  //<StrictMode>
  <Provider store={store}>
    <SWRConfig
      value={{
        fetcher,
        shouldRetryOnError: false, // Default SWR behavior can be customized here
        revalidateOnFocus: false, // Prevents revalidating every time window is focused
      }}
    >
      <RouterProvider router={router} />
    </SWRConfig>
  </Provider>
  // </StrictMode>,
)
