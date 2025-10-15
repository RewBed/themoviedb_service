import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { TmdbApiClient } from 'src/tmdb/tmdb-api.client';
import { FullFilmData, FilmsServiceClient } from 'src/proto/films';

@Injectable()
export class MovieListService implements OnModuleInit {
  private tmdb: TmdbApiClient;
  private filmsServiceClient: FilmsServiceClient;

  constructor(
    @Inject('FILMS_SERVICE') private readonly client: ClientGrpc, // gRPC клиент через DI
  ) {
    this.tmdb = new TmdbApiClient(
      process.env.TMDB_API_TOKEN || '',
      'ru-RU',
    );
  }

  onModuleInit() {
    this.filmsServiceClient = this.client.getService<FilmsServiceClient>('FilmsService');
  }

  private mapMovieToFullFilmData(item: any): FullFilmData {
    const releaseDate = item?.release_date
    ? { seconds: Math.floor(new Date(item.release_date).getTime() / 1000), nanos: 0 }
    : undefined;

    const film = {
      themoviedbId: typeof item?.id === 'number' ? item.id : 0,
      title: typeof item?.title === 'string' ? item.title : '',
      originalTitle: typeof item?.original_title === 'string' ? item.original_title : '',
      overview: typeof item?.overview === 'string' ? item.overview : '',
      releaseDate,
      originalLanguage: typeof item?.original_language === 'string' ? item.original_language : '',
      budget: typeof item?.budget === 'number' ? item.budget : 0,
      revenue: typeof item?.revenue === 'number' ? item.revenue : 0,
      runtime: typeof item?.runtime === 'number' ? item.runtime : 0,
      status: typeof item?.status === 'string' ? item.status : '',
      tagline: typeof item?.tagline === 'string' ? item.tagline : '',
      homepage: typeof item?.homepage === 'string' ? item.homepage : '',
      posterPath: typeof item?.poster_path === 'string' ? item.poster_path : '',
      backdropPath: typeof item?.backdrop_path === 'string' ? item.backdrop_path : '',
      popularity: typeof item?.popularity === 'number' ? item.popularity : 0,
      voteAverage: typeof item?.vote_average === 'number' ? item.vote_average : 0,
      voteCount: typeof item?.vote_count === 'number' ? item.vote_count : 0,
      adult: typeof item?.adult === 'boolean' ? item.adult : false,
      video: typeof item?.video === 'boolean' ? item.video : false,
    };

    const genres = Array.isArray(item?.genres)
      ? item.genres.map((g: any) => ({
          themoviedbId: typeof g.id === 'number' ? g.id : 0,
          name: typeof g.name === 'string' ? g.name : '',
        }))
      : [];

    const companies = Array.isArray(item?.production_companies)
      ? item.production_companies.map((c: any) => ({
          themoviedbId: typeof c.id === 'number' ? c.id : 0,
          name: typeof c.name === 'string' ? c.name : '',
          originCountry: typeof c.origin_country === 'string' ? c.origin_country : '',
        }))
      : [];

    const countries = Array.isArray(item?.production_countries)
      ? item.production_countries.map((c: any) => ({
          themoviedbId: typeof c.id === 'number' ? c.id : 0, // можно оставить 0 если нет id в API
          isoCode: typeof c.iso_3166_1 === 'string' ? c.iso_3166_1 : '',
          name: typeof c.name === 'string' ? c.name : '',
        }))
      : [];

    const languages = Array.isArray(item?.spoken_languages)
      ? item.spoken_languages.map((l: any) => ({
          isoCode: typeof l.iso_639_1 === 'string' ? l.iso_639_1 : '',
          name: typeof l.name === 'string' ? l.name : '',
          english_name: typeof l.english_name === 'string' ? l.english_name : '',
        }))
      : [];

    return {
      film,
      genres,
      companies,
      countries,
      languages,
    };
  }

  async fetchTopRatedMovies(startPage = 1, endPage = 500) {
    for (let page = startPage; page <= endPage; page++) {
      const data = await this.tmdb.getTopRated(page);
      console.log(`Страница ${page}:`, data.results.length, 'фильмов');

      for (const item of data.results) {
        try {

          const fullFilm = await this.tmdb.getMovieDetails(item.id);

          await this.filmsServiceClient.upsertFilm(this.mapMovieToFullFilmData(fullFilm)).toPromise();
        } catch (err) {
          console.error('Ошибка при создании фильма через gRPC:', err);
        }
      }
    }

    console.log("fetch ended");
  }
}
