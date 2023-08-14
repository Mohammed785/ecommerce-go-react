import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { ThemeProvider } from "./context/ThemeContext"
import { Toaster } from "@/components/ui/toaster"

const router = createBrowserRouter([
  {
    path:"/login",
    element:<Login/>
  },
  {
    path:"/register",
    element:<Register/>
  }
])

function App() {
  return (
    <>
    <ThemeProvider defaultTheme="system" >
      <RouterProvider router={router}/>
      <Toaster/>
    </ThemeProvider>
    </>
  )
}

export default App
