import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AxiosResponse} from 'axios';
import {HttpService} from "@nestjs/axios";

@Injectable({
  durable: true
})
export class JustWatchService {
  private apiBaseTemplate: string;
  private country: string;
  private locale: string;
  private headers = { 'User-Agent':'JustWatch client (github.com/dawoudt/JustWatchAPI)' };

  private httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
    this.apiBaseTemplate = "https://apis.justwatch.com/content/{path}";
    this.country = 'AU';
    this.locale = 'en_AU'; // This should be set by setLocale()
  }

  buildApiUrl(path: string): string {
    return this.apiBaseTemplate.replace('{path}', path);
  }

  async searchForItem(query: string, options: Record<string, any> = {}): Promise<any> {
    const path = `titles/${this.locale}/popular`;
    const apiUrl = this.buildApiUrl(path);

    const payload = { 'query': query, ...options };

    for (const key in options) {
      if (key in payload) {
        payload[key] = options[key];
      } else {
        console.log(`${key} is not a valid keyword`);
      }
    }

    if (query) {
      payload["query"] = query;
    }

    try {
      const response = await this.httpService.post(apiUrl, payload, { headers: this.headers }).toPromise();
      return response.data;
    } catch (error) {
      throw new HttpException('Error while fetching data from JustWatch API', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async setLocale(): Promise<void> {
    const path = 'locales/state';
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        this.locale = response.data.full_locale;
      }
    } catch(error) {
      console.error(`Unable to set locale for ${this.country}. Defaulting to en_AU`);
    }
  }

  async getProviders(): Promise<any> {
    const path = `providers/locale/${this.locale}`;
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch(error) {
      console.error(`Failed to get providers for locale: ${this.locale}`);
    }
  }

  async getGenres(): Promise<any> {
    const path = `genres/locale/${this.locale}`;
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch(error) {
      console.error(`Failed to get genres for locale: ${this.locale}`);
    }
  }

  async getTitle(titleId: number, contentType = 'movie'): Promise<any> {
    const path = `titles/${contentType}/${titleId}/locale/${this.locale}`;
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch(error) {
      console.error(`Failed to get title with id: ${titleId}`);
    }
  }

  async getSeason(seasonId: number): Promise<any> {
    const path = `titles/show_season/${seasonId}/locale/${this.locale}`;
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch(error) {
      console.error(`Failed to get season with id: ${seasonId}`);
    }
  }

  async getPersonDetail(personId: number): Promise<any> {
    const path = `titles/person/${personId}/locale/${this.locale}`;
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch(error) {
      console.error(`Failed to get person detail with id: ${personId}`);
    }
  }

    async searchTitleId(query: string): Promise<any> {
    const results = await this.searchForItem(query);

    const titleIds = {};
    for (const item of results['items']) {
      titleIds[item['id']] = item['title'];
    }

    return titleIds;
  }

  // other methods...

  async getEpisodes(showId: number, page = ''): Promise<any> {
    let path = `titles/show/${showId}/locale/${this.locale}/newest_episodes`;
    if (page) {
      path = path + '?page=' + page;
    }
    const apiUrl = this.apiBaseTemplate.replace('{path}', path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to get episodes for show with id: ${showId}`);
    }
  }

  // other methods...

  async getCinemaTimes(titleId: number, contentType = 'movie', kwargs: any = {}): Promise<any> {
    const payload = {
      "date": null,
      "latitude": null,
      "longitude": null,
      "radius": 20000
    };
    Object.assign(payload, kwargs);

    const apiUrl = `https://apis.justwatch.com/content/titles/${contentType}/${titleId}/showtimes`;

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl, {params: payload}).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to get cinema times for title with id: ${titleId}`);
    }
  }

  // other methods...

  async getUpcomingCinema(weeksOffset: number, nationwideCinemaReleasesOnly = true): Promise<any> {
    const payload = {'nationwide_cinema_releases_only': nationwideCinemaReleasesOnly, 'body': {}};
    const nowDate = new Date();
    nowDate.setDate(nowDate.getDate() + weeksOffset * 7);
    const year = nowDate.getFullYear();
    const weekNumber = this.getWeekNumber(nowDate);

    const path = `titles/movie/upcoming/${year}/${weekNumber}/locale/${this.locale}`;
    const apiUrl = this.buildApiUrl(path);

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl, {params: payload, headers: this.headers}).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to get upcoming cinema`);
      throw new HttpException('Failed to get upcoming cinema', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  getWeekNumber(d: Date): number {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    // Return array of year and week number
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  async getCertifications(contentType = 'movie'): Promise<any> {
    const payload = { 'country': this.country, 'object_type': contentType };
    const apiUrl = 'https://apis.justwatch.com/content/age_certifications';

    try {
      const response: AxiosResponse = await this.httpService.get(apiUrl, { params: payload }).toPromise();
      if (response.status === 200) {
        return response.data;
      }
    } catch(error) {
      console.error(`Failed to get certifications for type: ${contentType}`);
    }
  }

}
