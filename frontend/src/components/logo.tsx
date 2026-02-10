
import { AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: number; // Size of the outer container
}

export const Logo = ({ className, size = 40 }: LogoProps) => {
    // Icon size is proportional to container size
    const iconSize = size * 0.6;

    return (
        <div
            className={cn(
                "relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20",
                className
            )}
            style={{ width: size, height: size }}
        >
            <AudioWaveform
                size={iconSize}
                className="text-white drop-shadow-sm"
                strokeWidth={2.5}
            />
            {/* Playful shine effect */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full blur-[2px] opacity-60" />
        </div>
    );
};
