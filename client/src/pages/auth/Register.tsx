import RegisterForm from "@/components/Auth/RegisterForm"
import { Link } from "react-router-dom"

function Register(){
    return <div className="container relative flex h-screen flex-col items-center justify-center">
        <div className="mx-auto w-full flex flex-col items-center justify-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">
                Create Account
            </h1>
            <div className="grid gap-6">
                <RegisterForm />
                <Link to="/login" className="underline underline-offset-4 hover:text-primary text-muted-foreground text-sm">Already have an account?</Link>
            </div>
        </div>
    </div>
}

export default Register;