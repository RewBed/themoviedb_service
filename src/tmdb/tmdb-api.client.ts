import axios, { AxiosInstance } from 'axios';

export class TmdbApiClient {
  private client: AxiosInstance;

  constructor(apiToken: string, private language = 'ru-RU') {
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        accept: 'application/json',
      },
    });
  }

  // Общий метод для GET-запросов
  private async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  // Получить топовые фильмы (top_rated)
  async getTopRated(page = 1) {
    return this.get<{
      page: number;
      results: any[];
      total_pages: number;
      total_results: number;
    }>('movie/top_rated', { page, language: this.language });
  }

  /*
  // Получить популярные фильмы (popular)
  async getPopular(page = 1) {
    return this.get('movie/popular', { page, language: this.language });
  }
    */

  // Получить детали конкретного фильма по ID
  async getMovieDetails(movieId: number) {
    return this.get(`movie/${movieId}`, { language: this.language });
  }

  // Пример: поиск фильма
  /* async searchMovie(query: string, page = 1) {
    return this.get('search/movie', { query, page, language: this.language });
  } */
  
}
