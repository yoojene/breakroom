import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import { BreakroomConfig } from '../../app/app.config';

@Injectable()
export class PostcodeProvider {

  constructor(public http: HTTP,
              public httpCL: HttpClient,
              public config: BreakroomConfig) {
  }
  /**
   * Using ionic-native/http to get around WKWebView CORS restriction,
   * AusPost API does not implement it!
   * https://ionicframework.com/docs/wkwebview/#i-cant-implement-cors
   *
   */
  public async getPostCode(term) {
    /* Uncomment for Android or Chrome testing
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'auth-key': 'a4814300-f901-472f-b10d-c9da48453935',
      }),
      params: new HttpParams().set('q', term),
    };

    return this.httpCL.get(this.config.ausPostApiURL, httpOptions).toPromise();
*/
    const header = {
      'auth-key': 'a4814300-f901-472f-b10d-c9da48453935',
    };

    const params = {
      q: term.toString(),
    };

    return this.http.get(this.config.ausPostApiURL, params, header);
  }
}
