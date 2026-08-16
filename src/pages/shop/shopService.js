import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const API=`${API_BASE_URL}/api/shop`;

export const getProducts=()=>{

return axios.get(API);

};

export const addOrder=(data)=>{

return axios.post(API,data);

};