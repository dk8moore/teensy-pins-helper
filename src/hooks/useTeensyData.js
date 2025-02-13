import { useState, useEffect } from 'react';
import { TeensyDataError, safeJsonFetch } from '../lib/utils';

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

                const [pinShapes, capabilityDetails] = await Promise.all([
                    safeJsonFetch(`${basePath}/config/pin-shapes.json`),
                    safeJsonFetch(`${basePath}/config/capability-details.json`)
                ]).catch(error => {
                    if (!(error instanceof TeensyDataError)) {
                        throw new TeensyDataError(
                            'Failed to load configuration files',
                            `Multiple files failed to load: ${error.message}`
                        );
                    }
                    throw error;
                });

                const teensyData = await safeJsonFetch(`${basePath}/config/${modelId}.json`);

                setBoardUIData({
                    pinShapes,
                    capabilityDetails
                });
                setModelData(teensyData);
                setError(null);
            } catch (err) {
                console.error('Technical error details:', err.technicalDetails || err.message);
                setError(err instanceof TeensyDataError ? err.userMessage : 'An unexpected error occurred');
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