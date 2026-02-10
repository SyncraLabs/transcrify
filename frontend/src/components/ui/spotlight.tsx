
import React from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
    className?: string;
    fill?: string;
};

export function Spotlight({ className, fill }: SpotlightProps) {
    return (
        <svg
            className={cn(
                "animate-spotlight pointer-events-none absolute z-[1]  h-[169%] w-[138%] lg:w-[84%] opacity-0",
                className
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 3787 2842"
            fill="none"
        >
            <g filter="url(#filter0_f_2951_32462)">
                <path
                    fill={fill || "white"}
                    fillOpacity="0.21"
                    d="M3630.73 668.046L3786.17 197.804C3786.17 197.804 3302.58 -447.886 1709.61 -248.657C116.643 -49.4283 180.116 1133.02 180.116 1133.02L181.042 360.596C181.042 360.596 -250.219 -29.0768 1521.9 216.591C3294.02 462.259 3630.73 668.046 3630.73 668.046Z"
                />
            </g>
            <defs>
                <filter
                    id="filter0_f_2951_32462"
                    x="0.860352"
                    y="-1182.25"
                    width="3785.16"
                    height="2842.25"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feGaussianBlur
                        stdDeviation="151"
                        result="effect1_foregroundBlur_2951_32462"
                    />
                </filter>
            </defs>
        </svg>
    );
}
