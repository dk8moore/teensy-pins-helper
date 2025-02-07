import { useState, useEffect } from 'react';

export function useTeensyData(modelId = 'teensy41') {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [boardUIData, setBoardUIData] = useState(null);
    const [modelData, setModelData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const basePath = window.location.pathname.includes('teensy-pins-helper')
                    ? '/teensy-pins-helper'
                    : '';

                // Load static configuration files
                const [boardComponentsResponse, pinShapesResponse, capabilityDetailsResponse] = await Promise.all([
                    fetch(`${basePath}/config/board-components.json`),
                    fetch(`${basePath}/config/pin-shapes.json`),
                    fetch(`${basePath}/config/capability-details.json`)
                ]);

                if (!boardComponentsResponse.ok || !pinShapesResponse.ok || !capabilityDetailsResponse.ok) {
                    throw new Error('Failed to load configuration files');
                }

                const [boardComponents, pinShapes, capabilityDetails] = await Promise.all([
                    boardComponentsResponse.json(),
                    pinShapesResponse.json(),
                    capabilityDetailsResponse.json()
                ]);

                // Load model-specific data
                const modelDataResponse = await fetch(`${basePath}/config/${modelId}.json`);
                if (!modelDataResponse.ok) {
                    throw new Error(`Failed to load ${modelId} data`);
                }

                const teensyData = await modelDataResponse.json();

                setBoardUIData({
                    boardComponents,
                    pinShapes,
                    capabilityDetails
                });
                setModelData(teensyData);
                setError(null);
            } catch (err) {
                console.error('Failed to load Teensy data:', err);
                setError(err.message);
                setBoardUIData(null);
                setModelData(null);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [modelId]);

    return {
        loading,
        error,
        boardUIData,
        modelData
    };
}