import { useState, useEffect } from "react";
import * as Location from 'expo-location';

export const useWeather = () => {
    const [weather, setWeather] = useState<{ temp: number, condition: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                fetchWeather(location.coords.latitude, location.coords.longitude);
            } catch (e) {
                console.error("Location error:", e);
                setError("Failed to get location");
                setLoading(false);
            }
        })();
    }, []);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`
            );
            const data = await response.json();
            const code = data.current_weather.weathercode;
            const condition = getWeatherCondition(code);
            setWeather({
                temp: Math.round(data.current_weather.temperature),
                condition
            });
            setLoading(false);
        } catch (e) {
            console.error("Error fetching weather:", e);
            setError("Failed to fetch weather data");
            setLoading(false);
        }
    };

    const getWeatherCondition = (code: number) => {
        if (code === 0) return "Sunny";
        if (code >= 1 && code <= 3) return "Partly Cloudy";
        if (code >= 45 && code <= 48) return "Foggy";
        if (code >= 51 && code <= 67) return "Rainy";
        if (code >= 71 && code <= 77) return "Snowy";
        if (code >= 80 && code <= 82) return "Showers";
        if (code >= 95 && code <= 99) return "Thunderstorm";
        return "Cloudy";
    };

    return { weather, loading, error };
};
