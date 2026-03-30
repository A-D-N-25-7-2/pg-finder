import { useState } from "react";

const StarRating = ({ rating = 0, onRate, readonly = false, size = "text-2xl" }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} transition-all duration-150 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          style={{ color: (hovered || rating) >= star ? "#f59e0b" : "#d1d5db" }}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
