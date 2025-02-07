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
                const [boardComponentsResponse, pinTypesResponse] = await Promise.all([
                    fetch(`${basePath}/config/board-components.json`),
                    fetch(`${basePath}/config/pin-types.json`)
                ]);

                if (!boardComponentsResponse.ok || !pinTypesResponse.ok) {
                    throw new Error('Failed to load configuration files');
                }

                const [boardComponents, pinTypes] = await Promise.all([
                    boardComponentsResponse.json(),
                    pinTypesResponse.json()
                ]);

                // Load model-specific data
                const modelDataResponse = await fetch(`${basePath}/config/${modelId}.json`);
                if (!modelDataResponse.ok) {
                    throw new Error(`Failed to load ${modelId} data`);
                }

                const teensyData = await modelDataResponse.json();

                setBoardUIData({
                    boardComponents,
                    pinTypes
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