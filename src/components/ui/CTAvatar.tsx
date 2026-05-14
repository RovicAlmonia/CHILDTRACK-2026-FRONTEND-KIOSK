// src/components/ui/CTAvatar.tsx
// ─── Avatar with initials fallback ────────────────────────────────────────────
//
// Usage:
//   <CTAvatar name="Juan Cruz" />
//   <CTAvatar name="Maria Santos" size={40} />
//   <CTAvatar src="/photos/student.jpg" name="Ana" />

import { Avatar, Tooltip } from '@mui/material';
import type { AvatarProps } from '@mui/material';
import { CT } from '../../theme/tokens';

interface CTAvatarProps extends Omit<AvatarProps, 'children'> {
  name:     string;
  size?:    number;
  tooltip?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
}

function getColor(name: string): string {
  const colors = [
    CT.green[800], CT.status.pickup.bg,
    CT.status.late.bg, '#7b1fa2', '#00838f', '#ad1457',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function CTAvatar({ name, size = 36, tooltip = false, src, sx, ...rest }: CTAvatarProps) {
  const avatar = (
    <Avatar
      src={src}
      {...rest}
      sx={{
        width:      size,
        height:     size,
        fontSize:   size * 0.38,
        fontWeight: 700,
        background: src ? undefined : getColor(name),
        fontFamily: CT.font.family,
        flexShrink: 0,
        ...sx,
      }}
    >
      {!src && getInitials(name)}
    </Avatar>
  );

  return tooltip ? <Tooltip title={name}>{avatar}</Tooltip> : avatar;
}