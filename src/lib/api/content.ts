import { apiRequest } from "./client";
import type { News, Media, Faq } from "@/lib/types";

// ================== NEWS ==================

export const getNews = () => apiRequest<News[]>("/news");
export const getNewsById = (id: string) => apiRequest<News>(`/news/${id}`);

export const createNews = (data: {
  title: string;
  content: string;
  coverImage?: string;
  publishedAt?: string;
}) =>
  apiRequest<News>("/admin/news", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateNews = (
  id: string,
  data: Partial<{ title: string; content: string; coverImage: string; publishedAt: string }>
) =>
  apiRequest<News>(`/admin/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteNews = (id: string) =>
  apiRequest<void>(`/admin/news/${id}`, { method: "DELETE" });

// ================== MEDIA ==================

export const getMedia = (category?: string) =>
  apiRequest<Media[]>(`/media${category ? `?category=${category}` : ""}`);

export const createMedia = (data: {
  imageUrl: string;
  caption?: string;
  category?: string;
}) =>
  apiRequest<Media>("/admin/media", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteMedia = (id: string) =>
  apiRequest<void>(`/admin/media/${id}`, { method: "DELETE" });



// ================== FAQ ==================

export const getFaqs = () => apiRequest<Faq[]>("/faqs");

export const createFaq = (data: { question: string; answer: string; order?: number }) =>
  apiRequest<Faq>("/admin/faqs", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateFaq = (
  id: string,
  data: Partial<{ question: string; answer: string; order: number }>
) =>
  apiRequest<Faq>(`/admin/faqs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteFaq = (id: string) =>
  apiRequest<void>(`/admin/faqs/${id}`, { method: "DELETE" });
