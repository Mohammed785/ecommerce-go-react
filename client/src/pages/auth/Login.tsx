import LoginForm from "@/components/Auth/Login";
import { Link } from "react-router-dom";

function Login(){
    return <div className="container relative flex h-screen flex-col items-center justify-center">
        <div className="mx-auto w-full flex flex-col items-center justify-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">
                Welcome Back
            </h1>
            <div className="grid gap-6 md:w-72 xl:w-96">
                <LoginForm/>
                <Link to="/register" className="underline underline-offset-4 hover:text-primary text-muted-foreground text-sm">Don't have account?</Link>
            </div>
        </div>
    </div>
}

export default Login;