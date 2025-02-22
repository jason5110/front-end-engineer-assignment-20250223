import {  debounceTime, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';

import { CurrentSearch, SearchService } from './services/search.service';
import { SearchConfigService } from './services/search-config.service';

interface SearchResult {
  num_found: number;
  docs: {
    title: string;
    author_name: string[];
    cover_edition_key: string;
  }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatPaginatorModule,
  ],
  // BONUS: Use DI to update the config of SearchService to update page size
  providers: [SearchService, {
    provide: SearchConfigService, useValue: { defaultPageSize: 20 }
  }],
})
export class AppComponent {
  private $http = inject(HttpClient);
  $search = inject(SearchService)

  searchResults$ = this.$search.currentSearch$.pipe(
    distinctUntilChanged(),
    debounceTime(800),
    filter((data) => !!data),
    switchMap(data => this.searchBooks(data))
  );

  onSearchInputChange(event: Event) {
    this.$search.searchText = (event.target as HTMLInputElement).value;
  }

  searchBooks(currentSearch: CurrentSearch): Observable<SearchResult> {
    const { searchText, pageSize, page } = currentSearch;
    const searchQuery = searchText.split(' ').join('+').toLowerCase();

    return this.$http.get<SearchResult>(
      `https://openlibrary.org/search.json?q=${searchQuery}&page=${page}&limit=${pageSize}`
    );
  }
}
