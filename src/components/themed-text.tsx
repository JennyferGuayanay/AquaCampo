import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const clases = {
    default: 'text-base font-medium leading-6',
    title: 'text-5xl font-semibold leading-[52px]',
    small: 'text-sm font-medium leading-5',
    smallBold: 'text-sm font-bold leading-5',
    subtitle: 'text-3xl font-semibold leading-[44px]',
    link: 'text-sm leading-[30px]',
    linkPrimary: 'text-sm leading-[30px] text-blue-500',
    code: 'font-mono text-xs font-bold',
  }[type];

  return (
    <Text
      className={`${clases} ${className ?? ''}`}
      style={[{ color: theme[themeColor ?? 'text'] }, style]}
      {...rest}
    />
  );
}
