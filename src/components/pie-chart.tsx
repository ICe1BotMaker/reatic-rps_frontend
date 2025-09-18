"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface PieChartData {
    label: string;
    value: number;
    color?: string;
}

interface PieChartProps {
    data: PieChartData[];
    width?: number;
    height?: number;
    innerRadius?: number;
    showLegend?: boolean;
    showLabels?: boolean;
    showTooltip?: boolean;
    animationDuration?: number;
    className?: string;
}

const defaultColors = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
    "#6b7280", // gray-500
];

export const PieChart = ({
    data,
    width = 400,
    height = 400,
    innerRadius = 0,
    showLegend = true,
    showLabels = true,
    showTooltip = true,
    animationDuration = 1000,
    className = "",
}: PieChartProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
    const [tooltip, setTooltip] = useState<{
        show: boolean;
        x: number;
        y: number;
        content: string;
    }>({ show: false, x: 0, y: 0, content: "" });
    const [animationProgress, setAnimationProgress] = useState(0);

    // Calculate total and percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithColors = data.map((item, index) => ({
        ...item,
        color: item.color || defaultColors[index % defaultColors.length],
        percentage: (item.value / total) * 100,
    }));

    // Animation
    useEffect(() => {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            // Easing function
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            setAnimationProgress(easeOutCubic(progress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [animationDuration]);

    // Drawing function
    const drawPieChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size for retina displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        let currentAngle = -Math.PI / 2; // Start from top

        dataWithColors.forEach((item, index) => {
            const sliceAngle =
                (item.value / total) * 2 * Math.PI * animationProgress;

            // Draw slice
            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                radius,
                currentAngle,
                currentAngle + sliceAngle
            );
            if (innerRadius > 0) {
                ctx.arc(
                    centerX,
                    centerY,
                    innerRadius,
                    currentAngle + sliceAngle,
                    currentAngle,
                    true
                );
            } else {
                ctx.lineTo(centerX, centerY);
            }
            ctx.closePath();

            // Apply hover effect
            const isHovered = hoveredSegment === index;
            ctx.fillStyle = item.color;
            ctx.globalAlpha = isHovered ? 0.8 : 1;
            ctx.fill();

            // Add subtle stroke
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1;
            ctx.stroke();

            // Draw labels
            if (showLabels && item.percentage > 5) {
                // Only show labels for slices > 5%
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + Math.cos(labelAngle) * labelRadius;
                const labelY = centerY + Math.sin(labelAngle) * labelRadius;

                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`${item.percentage.toFixed(1)}%`, labelX, labelY);
            }

            currentAngle += sliceAngle;
        });
    }, [
        dataWithColors,
        total,
        width,
        height,
        innerRadius,
        hoveredSegment,
        showLabels,
        animationProgress,
    ]);

    // Handle mouse events
    const handleMouseMove = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            if (!showTooltip) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 20;

            const distance = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );

            if (distance <= radius && distance >= innerRadius) {
                let angle = Math.atan2(y - centerY, x - centerX);
                angle = angle < -Math.PI / 2 ? angle + 2 * Math.PI : angle;
                angle += Math.PI / 2;

                let currentAngle = 0;
                let hoveredIndex = -1;

                for (let i = 0; i < dataWithColors.length; i++) {
                    const sliceAngle =
                        (dataWithColors[i].value / total) * 2 * Math.PI;
                    if (
                        angle >= currentAngle &&
                        angle < currentAngle + sliceAngle
                    ) {
                        hoveredIndex = i;
                        break;
                    }
                    currentAngle += sliceAngle;
                }

                if (hoveredIndex !== -1) {
                    setHoveredSegment(hoveredIndex);
                    setTooltip({
                        show: true,
                        x: event.clientX, // 페이지 기준 절대 좌표 사용
                        y: event.clientY, // 페이지 기준 절대 좌표 사용
                        content: `${dataWithColors[hoveredIndex].label}: ${
                            dataWithColors[hoveredIndex].value
                        } (${dataWithColors[hoveredIndex].percentage.toFixed(
                            1
                        )}%)`,
                    });
                } else {
                    setHoveredSegment(null);
                    setTooltip((prev) => ({ ...prev, show: false }));
                }
            } else {
                setHoveredSegment(null);
                setTooltip((prev) => ({ ...prev, show: false }));
            }
        },
        [dataWithColors, total, width, height, innerRadius, showTooltip]
    );

    const handleMouseLeave = useCallback(() => {
        setHoveredSegment(null);
        setTooltip((prev) => ({ ...prev, show: false }));
    }, []);

    // Draw chart
    useEffect(() => {
        drawPieChart();
    }, [drawPieChart]);

    return (
        <div className={`relative inline-block ${className}`}>
            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer"
                    style={{ width, height }}
                />
            </div>

            {/* Tooltip - fixed positioning */}
            {tooltip.show && (
                <div
                    className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 60, // 마우스 위에 툴팁 표시
                        transform: "translateX(-50%)",
                    }}
                >
                    {tooltip.content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}

            {/* Legend */}
            {showLegend && (
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    {dataWithColors.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                            onMouseEnter={() => setHoveredSegment(index)}
                            onMouseLeave={() => setHoveredSegment(null)}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">
                                {item.label}
                            </span>
                            <span className="text-sm text-gray-500">
                                ({item.percentage.toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
