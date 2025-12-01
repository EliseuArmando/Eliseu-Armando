export enum AppTab {
  STRATEGIST = 'STRATEGIST',
  EDITOR = 'EDITOR',
  PROPAGANDA = 'PROPAGANDA', // Video (Veo)
  FORGE = 'FORGE', // Pro Image Gen
  COUNCIL = 'COUNCIL', // Live API
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: string | null; // For text or image URL
}

export interface VeoConfig {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface ProImageConfig {
  size: '1K' | '2K' | '4K';
  aspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
}
