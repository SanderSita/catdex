import { CatFaceIcon } from './avatar/CatFaceIcon';
import { DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_ICON, isCatIconId } from '../data/avatars';

interface AvatarThumbProps {
  icon?: string | null;
  color?: string | null;
  size?: number;
}

export function AvatarThumb({ icon, color, size = 44 }: AvatarThumbProps) {
  const expression = icon && isCatIconId(icon) ? icon : DEFAULT_AVATAR_ICON;
  return <CatFaceIcon expression={expression} color={color || DEFAULT_AVATAR_COLOR} size={size} />;
}
