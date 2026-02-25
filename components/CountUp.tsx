import React, { useEffect, useState } from "react";

// 1. Extract animation logic into a reusable custom hook
export const useCountUp = (
  end: number,
  start: number = 0,
  duration: number = 1000
) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;
    const totalChange = end - start;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.floor(eased * totalChange + start);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure exact final value
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, start, duration]);

  return count;
};

// 2. Define clear props, adding new capabilities
interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  useGrouping?: boolean; // Enables formatting like "1,000" instead of "1000"
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 1000,
  useGrouping = true,
}) => {
  const count = useCountUp(end, start, duration);

  // 3. Format the number for better UI presentation
  const formattedCount = useGrouping ? count.toLocaleString() : count;

  return <span>{formattedCount}</span>;
};

export default CountUp;
