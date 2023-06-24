import { Injectable } from '@nestjs/common';

@Injectable({
  durable: true
})
export class TmdbService {}
