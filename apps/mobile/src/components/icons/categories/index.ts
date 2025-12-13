export { EntertainmentIcon } from "./EntertainmentIcon";
export { TechGamingIcon } from "./TechGamingIcon";
export { MusicIcon } from "./MusicIcon";
export { SocialFigureIcon } from "./SocialFigureIcon";
export { FashionIcon } from "./FashionIcon";
export { SportsIcon } from "./SportsIcon";
export { HealthFitnessIcon } from "./HealthFitnessIcon";
export { TravelIcon } from "./TravelIcon";
export { BeautyIcon } from "./BeautyIcon";
export { BusinessIcon } from "./BusinessIcon";

import { EntertainmentIcon } from "./EntertainmentIcon";
import { TechGamingIcon } from "./TechGamingIcon";
import { MusicIcon } from "./MusicIcon";
import { SocialFigureIcon } from "./SocialFigureIcon";
import { FashionIcon } from "./FashionIcon";
import { SportsIcon } from "./SportsIcon";
import { HealthFitnessIcon } from "./HealthFitnessIcon";
import { TravelIcon } from "./TravelIcon";
import { BeautyIcon } from "./BeautyIcon";
import { BusinessIcon } from "./BusinessIcon";

// Map of category types to icon components
export const CATEGORY_ICONS = {
  entertainment: EntertainmentIcon,
  "tech-gaming": TechGamingIcon,
  music: MusicIcon,
  "social-figure": SocialFigureIcon,
  fashion: FashionIcon,
  sports: SportsIcon,
  "health-fitness": HealthFitnessIcon,
  travel: TravelIcon,
  beauty: BeautyIcon,
  business: BusinessIcon,
} as const;

export type CategoryIconType = keyof typeof CATEGORY_ICONS;
