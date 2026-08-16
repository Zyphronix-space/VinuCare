import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const API = `${API_BASE_URL}/api/appointments`;

export const createAppointment = (data) => {
    return axios.post(API, data);
};

export const getAppointments = () => {
    return axios.get(API);
};

export const updateAppointment = (id, data) => {
    return axios.put(`${API}/${id}`, data);
};

export const deleteAppointment = (id) => {
    return axios.delete(`${API}/${id}`);
};