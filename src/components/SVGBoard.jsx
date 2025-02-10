import React from 'react';
import { cn } from '@/lib/utils';
import teensy41Svg from '@/models/teensy41.svg?raw';

const BoardSVGWrapper = ({ className, ...props }) => {
    // Parse the SVG to get its viewBox attribute
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = teensy41Svg;
    const svgElement = tempDiv.querySelector('svg');
    const viewBox = svgElement?.getAttribute('viewBox') || "0 0 400 300"; // fallback dimensions

    return (
        <div className={className}>
            <svg
                viewBox={viewBox}
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={{ __html: svgElement?.innerHTML || '' }}
                {...props}
            />
        </div>
    );
};

const TeensyBoardSVG = ({
    modelData,
    boardUIData,
    onPinClick,
    selectedPinMode,
    assignments = {},
    highlightedCapability,
    assignedPins = []
}) => {
    const getPinColor = (pin, type) => {
        const colorMap = {
            'GND': '#312f2f',
            '3V3': '#dc4b4f',
            'can': '#fad0df',
            'spi': '#c0e7b1',
            'i2c': '#c6b7db',
            'serial': '#dde3f2',
            'pwm': '#f9acae',
            'analog': '#fbd4a3',
            'digital': '#cfd2d2',
            'ethernet': '#f9e2d2',
        };

        if (assignedPins.includes(pin.id)) {
            return {
                fill: colorMap[assignments[pin.id]?.type] || '#cccccc',
                opacity: 0.7,
                strokeWidth: 3,
                stroke: '#666666'
            };
        }

        if (pin.type === 'GND' || pin.type === '3V3' || !pin.capabilities) {
            return {
                fill: colorMap[pin.type] || '#cccccc',
                opacity: 1,
                strokeWidth: 2,
                stroke: 'black'
            };
        }

        if (highlightedCapability && pin.capabilities[highlightedCapability]) {
            return {
                fill: colorMap[highlightedCapability] || '#cccccc',
                opacity: 1,
                strokeWidth: 3,
                stroke: 'black'
            };
        }

        if (type) {
            return {
                fill: colorMap[type] || '#cccccc',
                opacity: 1,
                strokeWidth: 2,
                stroke: 'black'
            };
        }

        return {
            fill: '#cccccc',
            opacity: highlightedCapability ? 0.3 : 1,
            strokeWidth: 2,
            stroke: 'black'
        };
    };

    const wrapperClasses = cn(
        'board-svg relative transform rotate-90',
        'transition-all duration-200'
    );

    return (
        <div className={wrapperClasses}>
            <BoardSVGWrapper className="w-full h-full"
                style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                }} />

            {/* Interactive Pin Overlay */}
            <div className="absolute inset-0">
                {modelData.pins.map((pin) => {
                    const isAssigned = assignedPins.includes(pin.id);
                    const pinStyle = getPinColor(pin, assignments[pin.id]?.type);

                    return (
                        <button
                            key={pin.id}
                            className={cn(
                                'absolute rounded-full transition-all duration-200',
                                isAssigned ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                            )}
                            style={{
                                left: `${(pin.geometry.x / modelData.dimensions.width) * 100}%`,
                                top: `${(pin.geometry.y / modelData.dimensions.height) * 100}%`,
                                width: '12px',
                                height: '12px',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: pinStyle.fill,
                                opacity: pinStyle.opacity,
                                border: `${pinStyle.strokeWidth}px solid ${pinStyle.stroke}`
                            }}
                            onClick={() => !isAssigned && onPinClick(pin.id, pin.capabilities)}
                            title={`Pin ${pin.number?.toString() || pin.type}${isAssigned ? ' (Assigned)' : ''}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TeensyBoardSVG;