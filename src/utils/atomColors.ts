interface AtomColorScheme {
  [element: string]: string;
}

// CPK coloring scheme
export const defaultAtomColors: AtomColorScheme = {
  H: '#FFFFFF', // White
  C: '#909090', // Gray
  N: '#3050F8', // Blue
  O: '#FF0D0D', // Red
  F: '#90E050', // Light Green
  Cl: '#1FF01F', // Green
  Br: '#A62929', // Brown
  I: '#940094',  // Purple
  S: '#FFFF30',  // Yellow
  P: '#FF8000',  // Orange
  // Default for any other element
  DEFAULT: '#E8E8E8'
};

export const jmolAtomColors: AtomColorScheme = {
  H: '#FFFFFF',   // White
  C: '#909090',   // Gray
  N: '#3050F8',   // Blue
  O: '#FF0D0D',   // Red
  F: '#90E050',   // Light Green
  Cl: '#1FF01F',  // Green
  Br: '#A62929',  // Brown
  I: '#940094',   // Purple
  S: '#FFFF30',   // Yellow
  P: '#FF8000',   // Orange
  Si: '#DAA520',  // Gold
  Fe: '#E06633',  // Rust
  DEFAULT: '#E8E8E8'
};

export const getAtomColor = (element: string, colorScheme: AtomColorScheme = defaultAtomColors): string => {
  return colorScheme[element] || colorScheme.DEFAULT;
};

// Size mapping for atoms (van der Waals radii in Å, scaled)
export const atomSizes: {[element: string]: number} = {
  H: 0.25,
  C: 0.4,
  N: 0.38,
  O: 0.35,
  F: 0.31,
  Cl: 0.55,
  Br: 0.65,
  I: 0.7,
  S: 0.58,
  P: 0.58,
  DEFAULT: 0.4
};

export const getAtomSize = (element: string): number => {
  return atomSizes[element] || atomSizes.DEFAULT;
};