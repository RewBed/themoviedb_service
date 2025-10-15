import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MovieListModule } from './movie_list/movie_list.module';

@Module({
  imports: [
    MovieListModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
