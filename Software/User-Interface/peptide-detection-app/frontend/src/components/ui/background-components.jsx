import { cn } from '../../lib/utils';

/**
 * YellowGlowBackground
 * Full-screen canvas with a visible soft yellow radial glow at the centre.
 * Used as the background for the Login / unauthenticated view.
 */
export const YellowGlowBackground = ({ children, className }) => (
  <div
    className={cn('min-h-screen w-full relative overflow-hidden', className)}
    style={{
      background:
        'radial-gradient(ellipse 80% 60% at 50% 40%, #fef08a 0%, #fef9c3 35%, #f9fafb 100%)',
    }}
  >
    {/* Extra soft inner bloom */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(253,224,71,0.45) 0%, transparent 65%)',
      }}
    />
    <div className="relative z-10 w-full h-full">
      {children}
    </div>
  </div>
);

/**
 * OrangeGlowBackground
 * Full-screen canvas with a visible soft orange radial glow at the centre.
 * Suitable for high-alert / critical sections.
 */
export const OrangeGlowBackground = ({ children, className }) => (
  <div
    className={cn('min-h-screen w-full relative overflow-hidden', className)}
    style={{
      background:
        'radial-gradient(ellipse 80% 60% at 50% 40%, #fed7aa 0%, #fff7ed 40%, #f9fafb 100%)',
    }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(251,146,60,0.35) 0%, transparent 65%)',
      }}
    />
    <div className="relative z-10 w-full h-full">
      {children}
    </div>
  </div>
);

export default YellowGlowBackground;
