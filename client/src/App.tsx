import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { ThemeProvider } from "./context/ThemeContext"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"
import Home from "./pages/Home"
import RootLayout from "./components/Layout"
import ProductList from "./pages/product/List"
import ProductView from "./pages/product/View"
import ProductCreate from "./pages/admin/product/Create"
import ProductUpdate from "./pages/admin/product/Update"
import CategoriesPage from "./pages/admin/Categories"
import { CategoryProvider } from "./context/CategoryContext"
import AttributesPage from "./pages/admin/Attributes"
import AdminRequired from "./components/Auth/AdminRequired"

function Dashboard(){
  return <>
    <CategoryProvider>
      <Outlet/>
    </CategoryProvider>
  </>
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/products",
        element: <ProductList />
      },
      {
        path: "/product/:productId",
        element: <ProductView />
      },
      {
        path:"/dashboard",
        element: <AdminRequired><Dashboard /></AdminRequired> ,
        children:[
          {
            path:"product/new",
            element:<ProductCreate/>,
          },
          {
            path:"product/:productId",
            element:<ProductUpdate/>
          },
          {
            path:"categories",
            element:<CategoriesPage/>
          },
          {
            path:"attributes",
            element:<AttributesPage/>
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  }
])

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" >
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </>
  )
}

export default App
