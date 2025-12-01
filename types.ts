export interface Source {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: Source[];
}

export interface QuickCategory {
  id: string;
  label: string;
  query: string;
  icon: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}