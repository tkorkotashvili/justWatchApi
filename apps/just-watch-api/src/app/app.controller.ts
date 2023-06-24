import {Controller, Get, HttpException, HttpStatus} from "@nestjs/common";
import {JustWatchService} from "../services/justwatch/justwatch.service";

@Controller()
export class AppController {
  constructor(private readonly justWatchService: JustWatchService) {}

  @Get('search')
  async searchForAvatar() {
    const results = await this.justWatchService.searchForItem('Avatar', { 'release_year_from': 2009, 'release_year_until': 2009 });
    const response = [];

    if (results && results.items.length > 0) {
      for (const item of results.items) {
        const movie = {title: item.title, providers: []};

        if (item.offers) {
          for (const offer of item.offers) {
            movie.providers.push({
              provider: offer.provider_id,
              price: offer.monetization_type === 'rent' ? offer.retail_price : 'Free',
            });
          }
        } else {
          throw new HttpException('No results found for this title', HttpStatus.NOT_FOUND);
        }

        response.push(movie);
      }
    } else {
      throw new HttpException('No results found for Avatar (2009)', HttpStatus.NOT_FOUND);
    }

    return response;
  }

  // Other endpoints to test other JustWatchService methods...
}
