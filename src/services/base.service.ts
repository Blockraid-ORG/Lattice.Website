import axiosInstance from "@/lib/axios";
import { TOptionList } from "@/types/common";
import { TPagination } from "@/types/pagination";
import { TQueryParam } from "@/types/query";

export abstract class BaseService<T, TForm = Partial<T>, TResponse = T> {
  protected abstract endpoint: string;

  async GET_ALL(params?: TQueryParam): Promise<TPagination<T>> {
    const response = await axiosInstance({
      method: "GET",
      url: this.endpoint,
      params,
    });
    return response.data.data;
  }

  async LISTS(): Promise<TOptionList[]> {
    const response = await axiosInstance({
      method: "GET",
      url: this.endpoint,
      params: {
        noPaginate: 1,
      },
    });
    return response.data.data.map((item: any) => ({
      value: item.id,
      label: item.name,
      logo: item?.logo,
      icon: item?.icon,
      ticker: item?.ticker,
      type: item?.type,
    }));
  }

  async GET(params?: TQueryParam): Promise<TPagination<T>> {
    const response = await axiosInstance({
      method: "GET",
      url: this.endpoint + "/me",
      params,
    });
    return response.data.data;
  }
  async DETAIL(id: string): Promise<TResponse> {
    const response = await axiosInstance({
      method: "GET",
      url: `${this.endpoint}/${id}`,
    });

    return response.data.data;
  }

  async CREATE(form: TForm): Promise<TResponse> {
    const response = await axiosInstance({
      method: "POST",
      url: this.endpoint,
      data: form,
    });
    return response.data.data;
  }

  async DELETE(id: string): Promise<TResponse> {
    const response = await axiosInstance({
      method: "DELETE",
      url: `${this.endpoint}/${id}`,
    });
    return response.data.data;
  }

  async UPDATE(id: string, data: TForm): Promise<TResponse> {
    const response = await axiosInstance({
      method: "PATCH",
      url: `${this.endpoint}/${id}`,
      data,
    });
    return response.data.data;
  }

  /**
   * Upload file ke endpoint
   * @param file File atau Blob yang ingin di-upload
   * @param uploadPath string path tambahan misalnya "/upload" (default: "/upload")
   * @param fieldName nama field file (default: "file")
   */
  async UPLOAD(
    file: File | Blob,
    uploadPath = "/files/upload/local",
    fieldName = "file"
  ): Promise<TResponse> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await axiosInstance.post(
      `${this.endpoint}${uploadPath}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  }
}
