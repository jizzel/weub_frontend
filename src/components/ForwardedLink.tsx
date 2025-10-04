/**
 * Link component that forwards refs for use with Radix UI components
 * This is needed because react-router-dom's Link doesn't forward refs by default
 */

import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

export const ForwardedLink = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof Link>>(
  (props, ref) => <Link ref={ref} {...props} />
);

ForwardedLink.displayName = 'ForwardedLink';
