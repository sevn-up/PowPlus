import React, { useState, useEffect } from 'react';
import { Card, Spinner, Button, Alert } from 'react-bootstrap';
import { Brain, AlertTriangle, RefreshCw, MapPin, Bug } from 'lucide-react';

/**
 * BackcountryWisdomCard - LLM-powered safety insights card
 * Supports two variants:
 * - 'general': BC-wide snow report (50 words)
 * - 'location': Location-specific trip planning advice (75 words)
 */
const BackcountryWisdomCard = ({
    variant = 'general',  // 'general' | 'location'
    locationName = 'Western Canada',
    weatherConditions = null,
    avalancheDanger = null
}) => {
    const [wisdom, setWisdom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [debugInfo, setDebugInfo] = useState(null);

    // Get API key from environment variable
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // Debug logging on mount
    useEffect(() => {
        const debug = {
            hasApiKey: !!API_KEY,
            apiKeyLength: API_KEY?.length || 0,
            apiKeyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT_LOADED',
            environment: import.meta.env.MODE,
            variant,
            locationName,
            hasWeatherData: !!weatherConditions,
            hasAvalancheData: !!avalancheDanger
        };
        setDebugInfo(debug);
        console.log('🔍 BackcountryWisdomCard Debug Info:', debug);
    }, [API_KEY, variant, locationName, weatherConditions, avalancheDanger]);

    /**
     * Exponential backoff retry logic
     */
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const getBackoffDelay = (attempt) => {
        return Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
    };

    /**
     * Generate prompt based on variant
     */
    const generatePrompt = () => {
        const weatherContext = weatherConditions
            ? `Current conditions: ${weatherConditions.temp}°C, ${weatherConditions.description}, ${weatherConditions.snowfall}cm fresh snow.`
            : '';

        const avalancheContext = avalancheDanger
            ? `Avalanche danger: Alpine ${avalancheDanger.alpine}, Treeline ${avalancheDanger.treeline}, Below Treeline ${avalancheDanger.btl}.`
            : '';

        if (variant === 'general') {
            // 50-word BC-wide overview
            return `You are a backcountry safety expert. Provide a concise 50-word overview of current backcountry conditions in British Columbia. ${weatherContext} ${avalancheContext} Highlight: top regions for skiing/riding today, overall avalanche outlook, and one key safety tip. Be direct and practical. No headers or bullets, just flowing text.`;
        } else {
            // 75-word location-specific advice
            return `You are a backcountry safety expert. Provide a concise 75-word trip planning summary for ${locationName}. ${weatherContext} ${avalancheContext} Focus on: current conditions, key hazards specific to this location, terrain recommendations, and one actionable safety tip. Be direct and practical. No headers or bullets, just flowing text.`;
        }
    };

    /**
     * Generate safety summary using Gemini API
     */
    const fetchWisdom = async (attempt = 0) => {
        try {
            setLoading(true);
            setError(null);

            console.log(`🚀 Attempt ${attempt + 1}: Fetching wisdom for ${locationName} (${variant})`);

            // Check for API key first
            if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
                throw new Error('Gemini API key not configured. Please add your API key to the .env file and restart the dev server.');
            }

            const prompt = generatePrompt();
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

            console.log('📡 API URL:', apiUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
            console.log('📝 Prompt:', prompt.substring(0, 100) + '...');

            // Call Gemini API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: variant === 'general' ? 100 : 150,
                        topP: 0.8,
                        topK: 40
                    }
                })
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

            // Enhanced error handling for API response
            if (!response.ok) {
                let errorMessage = 'Failed to generate safety insights';

                try {
                    const errorData = await response.json();
                    console.error('❌ API Error Data:', errorData);

                    if (response.status === 400) {
                        errorMessage = 'Invalid API request. Please check your API key configuration.';
                    } else if (response.status === 403) {
                        errorMessage = 'API key is invalid or has been restricted. Please verify your Gemini API key at https://aistudio.google.com/app/apikey';
                    } else if (response.status === 429) {
                        errorMessage = 'API rate limit exceeded. Please try again in a few moments.';
                    } else if (errorData.error?.message) {
                        errorMessage = `API Error: ${errorData.error.message}`;
                    }
                } catch (parseError) {
                    console.error('❌ Failed to parse error response:', parseError);
                    errorMessage = `API returned error (${response.status}). Please check your configuration.`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ API Response:', data);

            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                throw new Error('No safety insights generated. The API returned an empty response.');
            }

            console.log('✅ Generated wisdom:', generatedText);
            setWisdom(generatedText.trim());
            setLoading(false);
            setRetryCount(0);

        } catch (err) {
            console.error('❌ Gemini API error:', err);

            // Retry logic with exponential backoff (only for network errors, not auth errors)
            const isRetryableError = !err.message.includes('API key') &&
                !err.message.includes('Invalid') &&
                !err.message.includes('restricted');

            if (attempt < 3 && isRetryableError) {
                const delay = getBackoffDelay(attempt);
                console.log(`⏳ Retrying in ${delay}ms... (attempt ${attempt + 1}/3)`);
                await sleep(delay);
                return fetchWisdom(attempt + 1);
            }

            // Max retries reached or non-retryable error
            setError(err.message);
            setLoading(false);
            setRetryCount(attempt);
        }
    };

    useEffect(() => {
        fetchWisdom();
    }, [variant, locationName, weatherConditions, avalancheDanger]);

    const handleRetry = () => {
        fetchWisdom();
    };

    const handleShowDebug = () => {
        alert(JSON.stringify(debugInfo, null, 2));
    };

    // Card title based on variant
    const cardTitle = variant === 'general' ? 'BC Snow Report' : 'Trip Planning Insights';
    const cardIcon = variant === 'general' ? Brain : MapPin;
    const CardIcon = cardIcon;

    return (
        <Card className="border-0 text-white shadow-lg mb-4" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase fw-bold small">
                        <CardIcon size={16} /> {cardTitle}
                    </div>
                    <div className="d-flex gap-2">
                        {wisdom && (
                            <Button
                                variant="link"
                                size="sm"
                                className="text-white-50 p-0 hover-scale"
                                onClick={handleRetry}
                                title="Refresh insights"
                            >
                                <RefreshCw size={14} />
                            </Button>
                        )}
                        <Button
                            variant="link"
                            size="sm"
                            className="text-white-50 p-0 hover-scale"
                            onClick={handleShowDebug}
                            title="Show debug info"
                        >
                            <Bug size={14} />
                        </Button>
                    </div>
                </div>

                {loading && (
                    <div className="d-flex align-items-center justify-content-center py-4">
                        <Spinner animation="border" variant="info" size="sm" className="me-2" />
                        <small className="text-white-50">
                            {variant === 'general' ? 'Generating BC snow report...' : 'Generating trip planning insights...'}
                        </small>
                    </div>
                )}

                {error && (
                    <Alert variant="warning" className="mb-0 bg-warning bg-opacity-10 border-warning border-opacity-25">
                        <div className="d-flex align-items-start gap-2">
                            <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
                            <div className="flex-grow-1">
                                <strong className="d-block mb-1">Unable to Generate Insights</strong>
                                <small className="d-block mb-2">{error}</small>
                                {debugInfo && !debugInfo.hasApiKey && (
                                    <small className="d-block mb-2 text-danger">
                                        ⚠️ API key not loaded. Check your .env file and restart the dev server.
                                    </small>
                                )}
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={handleRetry}
                                    >
                                        <RefreshCw size={12} className="me-1" />
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleShowDebug}
                                    >
                                        <Bug size={12} className="me-1" />
                                        Debug Info
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Alert>
                )}

                {wisdom && !loading && !error && (
                    <div className="bg-white bg-opacity-10 rounded-4 p-3">
                        <p className="mb-0 text-white" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {wisdom}
                        </p>
                        {variant === 'location' && (
                            <small className="text-white-50 d-block mt-2 fst-italic">
                                AI-generated advice for {locationName}
                            </small>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default BackcountryWisdomCard;
