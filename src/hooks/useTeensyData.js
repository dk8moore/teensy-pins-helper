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
                const capabilityDetailsWithMaxPinPort = countInterfacesPinPorts(capabilityDetails, teensyData.pins);

                setBoardUIData({
                    pinShapes,
                    capabilityDetails: capabilityDetailsWithMaxPinPort
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

function countInterfacesPinPorts(capabilities, pins) {
    for (const pin of pins) {
        if (pin.interfaces) {
            for (const [iface, content] of Object.entries(pin.interfaces)) {
                if (!capabilities[iface]) {
                    throw new TeensyDataError(
                        'Failed to load configuration files',
                        `Pin ${pin.id} has an interface ${iface} that is not defined in capability-details.json`
                    );
                }
                switch (capabilities[iface].allocation) {
                    case 'pin':
                        capabilities[iface].max = capabilities[iface].max ? capabilities[iface].max + 1 : 1;
                        break;
                    case 'port':
                        if (!capabilities[iface].portCount) {
                            capabilities[iface].portCount = {};
                        }
                        capabilities[iface].portCount[content.port] = capabilities[iface].portCount[content.port] ? capabilities[iface].portCount[content.port] + 1 : 1;
                        break;
                    case 'hybrid':
                    default:
                        // Not handled yet
                        break;
                }
            }
        } else if (pin.designation) {
            if (!capabilities[pin.designation]) {
                throw new TeensyDataError(
                    'Failed to load configuration files',
                    `Pin ${pin.name} has a designation ${pin.designation} that is not defined in capability-details.json`
                );
            }
            // Pin designations are always single pin allocations
            capabilities[pin.designation].max = capabilities[pin.designation].max ? capabilities[pin.designation].max + 1 : 1;
        }
    }

    // Sum up the port counts
    for (const [capability, content] of Object.entries(capabilities)) {
        if (content.portCount) {
            capabilities[capability].max = Object.keys(content.portCount).length;
            delete capabilities[capability].portCount;
        }
    }

    return capabilities;
}