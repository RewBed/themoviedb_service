import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieListModule } from './movie_list/movie_list.module';
import { TmdbCollectorModule } from './tmdb-collector/tmdb_collector.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MovieListModule,
    TmdbCollectorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
