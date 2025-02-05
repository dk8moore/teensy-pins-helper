import { useState, useEffect } from 'react';

export function useTeensyData() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [boardUIData, setBoardUIData] = useState(null);
    const [modelData, setModelData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const basePath = window.location.pathname.includes('teensy-pins-helper') 
                    ? '/teensy-pins-helper' 
                    : '';

                // Load board UI data (components and pin types)
                const [boardComponentsResponse, pinTypesResponse] = await Promise.all([
                    fetch(`${basePath}/config/board-components.json`),
                    fetch(`${basePath}/config/pin-types.json`)
                ]);

                if (!boardComponentsResponse.ok || !pinTypesResponse.ok) {
                    throw new Error('Failed to load one or more configuration files');
                }

                const [boardComponents, pinTypes] = await Promise.all([
                    boardComponentsResponse.json(),
                    pinTypesResponse.json()
                ]);

                // Load Teensy model data
                const modelDataResponse = await fetch(`${basePath}/config/teensy41.json`);
                if (!modelDataResponse.ok) {
                    throw new Error('Failed to load Teensy data');
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
                setError('Failed to load Teensy pin data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { loading, error, boardUIData, modelData };
}
