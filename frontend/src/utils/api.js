import axios from 'axios';

// const api=axios.create({
//     baseURL:"http://localhost:5000/api"
// });
const api=axios.create({
    baseURL:"https://investormatch-backend-yn2k.onrender.com/api"
});

api.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");
    if(token) config.headers.Authorization=`Bearer ${token}`;
    return config;
})

export default api;