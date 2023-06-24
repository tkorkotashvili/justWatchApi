import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HttpModule} from "@nestjs/axios";
import {JustWatchService} from "../services/justwatch/justwatch.service";

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService,JustWatchService],
})
export class AppModule {}
