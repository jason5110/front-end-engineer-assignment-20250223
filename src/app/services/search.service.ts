import { BehaviorSubject } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { forceBiggerThenOneNumber, getQueryParam } from '../libs/helper';
import { SearchConfigService } from './search-config.service';

// interface SearchConfig {
//   defaultPageSize?: number;
// }

export interface CurrentSearch {
  searchText: string;
  pageSize: number;
  page: number;
}

export interface ISearchService {
  searchText: string;
  pageSize: number;
  page: number;
  currentSearch$: BehaviorSubject<CurrentSearch | null>;
  submit(): void;
}

// BONUS: Use DI to update the config of SearchService to update page size
// export const SEARCH_CONFIG = undefined;

@Injectable()
export class SearchService implements ISearchService {
  searchText = '';
  pageSize = 10;
  page = 1;
  currentSearch$ = new BehaviorSubject<CurrentSearch | null>(null);
  config$ = inject(SearchConfigService);

  constructor(private router: Router) {
    if (this.config$.defaultPageSize) {
      this.pageSize = this.config$.defaultPageSize
    }
    this._initFromUrl();
  }

  // BONUS: Keep the current search params in the URL that allow users to refresh the page and search again
  private _initFromUrl() {
    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const q = getQueryParam(event.url, 'q');
        const searchText = q.split('%20').join(' ');

        if (searchText) {
          const page = getQueryParam(event.url, 'page');
          const limit = getQueryParam(event.url, 'limit');

          const intPage = parseInt(page)
          const intLimit = parseInt(limit)

          this.searchText = searchText;
          this.page = forceBiggerThenOneNumber(intPage)
          this.pageSize = forceBiggerThenOneNumber(intLimit, this.pageSize)

          this.currentSearch$.next({
            searchText: this.searchText,
            pageSize: this.pageSize,
            page: this.page,
          })
        }

        sub.unsubscribe()
      }
    })
  }

  changePage(newPage: number) {
    this.page = newPage
    this.submit()
  }

  changeUrlPrarms() {
    const currentSearchValue = this.currentSearch$.getValue()
    if (!currentSearchValue || !currentSearchValue.searchText) {
      this.router.navigate(
        ['/'],
      )
      return
    }

    this.router.navigate(
      ['/'],
      {
        queryParams: {
          q: currentSearchValue.searchText,
          page: currentSearchValue.page,
        }
      }
    )
  }

  updateCurrentSearch() {
    const currentSearchValue = this.currentSearch$.getValue()
    if (currentSearchValue?.["searchText"] != this.searchText) {
      this.page = 1;
    }

    this.currentSearch$.next({
      searchText: this.searchText,
      pageSize: this.pageSize,
      page: this.page,
    })
  }

  submit() {
    this.updateCurrentSearch()
    this.changeUrlPrarms()
  }
}
