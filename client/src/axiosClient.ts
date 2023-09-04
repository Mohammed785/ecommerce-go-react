import axios from "axios"


export const axiosClient = axios.create({
    baseURL:"http://localhost:8000/api/v1",
    withCredentials:true
})

axiosClient.interceptors.response.use((response)=>response,async(err)=>{
    if(err.response?.status===401){
        window.location.href = "/login"
        return
    }
    return Promise.reject(err)
})