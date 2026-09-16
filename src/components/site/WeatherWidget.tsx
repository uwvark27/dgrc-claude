const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=40.5044&longitude=-79.9278" +
  "&current=temperature_2m,relative_humidity_2m,dew_point_2m&temperature_unit=fahrenheit";
const AQI_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=40.5044&longitude=-79.9278" +
  "&current=us_aqi";

type WeatherData = {
  current: { temperature_2m: number; relative_humidity_2m: number; dew_point_2m: number };
};
type AqiData = {
  current: { us_aqi: number };
};

function aqiInfo(aqi: number): { label: string; className: string } {
  if (aqi <= 50) return { label: "Good", className: "text-green-700" };
  if (aqi <= 100) return { label: "Moderate", className: "text-yellow-700" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", className: "text-orange-600" };
  if (aqi <= 200) return { label: "Unhealthy", className: "text-red-600" };
  if (aqi <= 300) return { label: "Very Unhealthy", className: "text-purple-700" };
  return { label: "Hazardous", className: "text-red-900" };
}

export async function WeatherWidget() {
  const [weatherResult, aqiResult] = await Promise.allSettled([
    fetch(WEATHER_URL, { next: { revalidate: 1800 } }).then((r) => r.json() as Promise<WeatherData>),
    fetch(AQI_URL, { next: { revalidate: 1800 } }).then((r) => r.json() as Promise<AqiData>),
  ]);

  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const aqiData = aqiResult.status === "fulfilled" ? aqiResult.value : null;

  if (!weather && !aqiData) return null;

  const temp = weather ? Math.round(weather.current.temperature_2m) : null;
  const humidity = weather ? Math.round(weather.current.relative_humidity_2m) : null;
  const dewPoint = weather ? Math.round(weather.current.dew_point_2m) : null;
  const aqi = aqiData ? Math.round(aqiData.current.us_aqi) : null;
  const info = aqi !== null ? aqiInfo(aqi) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-700">
      <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
        Sharpsburg, PA
      </span>
      {temp !== null && (
        <span>
          <span className="font-semibold">{temp}°F</span>
        </span>
      )}
      {humidity !== null && (
        <span>
          Humidity <span className="font-semibold">{humidity}%</span>
        </span>
      )}
      {dewPoint !== null && (
        <span>
          Dew Point <span className="font-semibold">{dewPoint}°F</span>
        </span>
      )}
      {aqi !== null && info && (
        <span>
          AQI <span className="font-semibold">{aqi}</span>{" "}
          <span className={`text-xs font-medium ${info.className}`}>{info.label}</span>
        </span>
      )}
    </div>
  );
}
