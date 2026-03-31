import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = "http://10.0.2.2:8080";

class BackendApis {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async saveLog(logData: unknown): Promise<void> {
    await this.post("/gymLog", logData);
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.apiClient.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.apiClient.put<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.delete<T>(endpoint, config);
    return response.data;
  }
}

export default new BackendApis();
