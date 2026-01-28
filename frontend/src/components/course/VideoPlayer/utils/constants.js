// Video player constants

// Playback speed options
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Default playback speed
export const DEFAULT_PLAYBACK_SPEED = 1;

// Progress save interval in seconds
export const PROGRESS_SAVE_INTERVAL = 10;

// Controls hide timeout in milliseconds
export const CONTROLS_HIDE_TIMEOUT = 3000;

// Resume prompt threshold in seconds (show prompt if initialPosition > this)
export const RESUME_PROMPT_THRESHOLD = 30;

// Resume prompt auto-dismiss timeout in milliseconds
export const RESUME_PROMPT_TIMEOUT = 5000;

// Seek amount in seconds for keyboard shortcuts
export const SEEK_AMOUNT = 10;

// Volume change amount for keyboard shortcuts (0-1)
export const VOLUME_CHANGE_AMOUNT = 0.1;

// Video types
export const VIDEO_TYPES = {
  DIRECT: 'direct',
  YOUTUBE: 'youtube',
  GOOGLE_DRIVE: 'googledrive',
  GOOGLE_CLASSROOM: 'googleclassroom',
  VIMEO: 'vimeo',
  UNKNOWN: 'unknown',
};

// Embedded video types (require iframe)
export const EMBEDDED_TYPES = [
  VIDEO_TYPES.YOUTUBE,
  VIDEO_TYPES.GOOGLE_DRIVE,
  VIDEO_TYPES.GOOGLE_CLASSROOM,
  VIDEO_TYPES.VIMEO,
];

// Keyboard shortcuts mapping
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: [' ', 'k'],
  SEEK_BACKWARD: ['ArrowLeft'],
  SEEK_FORWARD: ['ArrowRight'],
  VOLUME_UP: ['ArrowUp'],
  VOLUME_DOWN: ['ArrowDown'],
  MUTE: ['m'],
  FULLSCREEN: ['f'],
  PIP: ['p'],
  SPEED_DOWN: ['<', ','],
  SPEED_UP: ['>', '.'],
  HELP: ['?'],
  ESCAPE: ['Escape'],
};
