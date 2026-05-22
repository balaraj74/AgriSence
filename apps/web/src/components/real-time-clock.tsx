
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export function RealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timerId); // Cleanup on component unmount
    };
  }, []);

  return (
    <div className="text-right">
        <p className="text-4xl font-bold">{format(time, "HH:mm")}</p>
        <p className="text-sm opacity-90">{format(time, "EEEE, d MMM yyyy")}</p>
    </div>
  );
}
