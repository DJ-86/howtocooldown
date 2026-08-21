"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CoolingForecast } from "@/components/CoolingForecast";

type Weather = {
  temperature: number;
  humidity: number;
  hourlyTime: string[];
  hourlyTemp: number[];
  observedAt: number;
};
type WeatherResponse = {
  current: { temperature_2m: number; relative_humidity_2m: number };
  hourly: { time: string[]; temperature_2m: number[] };
};
type Advice = { icon: string; title: string; reason: string; detail: string };
const cToF = (c: number) => Math.round((c * 9) / 5 + 32);
const showTemp = (c: number, unit: "C" | "F") =>
  `${unit === "C" ? Math.round(c) : cToF(c)}°${unit}`;

export default function Home() {
  const [unit, setUnitState] = useState<"C" | "F">("C");
  const [temperature, setTemperature] = useState("29");
  const [humidity, setHumidity] = useState("");
  const [outdoorManual, setOutdoorManual] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate user preferences from browser-only storage */
    const savedUnit = localStorage.getItem("htcd-unit");
    const savedTemp = localStorage.getItem("htcd-temp");
    const savedHumidity = localStorage.getItem("htcd-humidity");
    if (savedUnit === "F") setUnitState("F");
    if (savedTemp) setTemperature(savedTemp);
    if (savedHumidity) setHumidity(savedHumidity);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  const setUnit = (value: "C" | "F") => {
    setUnitState(value);
    localStorage.setItem("htcd-unit", value);
  };
  const indoorC = useMemo(
    () =>
      unit === "F" ? ((Number(temperature) - 32) * 5) / 9 : Number(temperature),
    [temperature, unit],
  );
  const outdoorC =
    weather?.temperature ??
    (outdoorManual
      ? unit === "F"
        ? ((Number(outdoorManual) - 32) * 5) / 9
        : Number(outdoorManual)
      : null);

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setWeatherError(
        "Location is unavailable. Add the outdoor temperature below.",
      );
      return;
    }
    setLoading(true);
    setWeatherError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const latitude = coords.latitude.toFixed(2);
          const longitude = coords.longitude.toFixed(2);
          const params = new URLSearchParams({
            latitude,
            longitude,
            current: "temperature_2m,relative_humidity_2m",
            hourly: "temperature_2m",
            forecast_days: "2",
            timezone: "auto",
          });
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`,
          );
          if (!response.ok) throw new Error();
          const data = (await response.json()) as WeatherResponse;
          setWeather({
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            hourlyTime: data.hourly.time,
            hourlyTemp: data.hourly.temperature_2m,
            observedAt: Date.now(),
          });
        } catch {
          setWeatherError(
            "We couldn’t load local weather. Add the outdoor temperature below.",
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setWeatherError(
          "Location wasn’t shared. Add the outdoor temperature below.",
        );
      },
      { timeout: 8000 },
    );
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("htcd-temp", temperature);
    if (humidity) localStorage.setItem("htcd-humidity", humidity);
    setSubmitted(true);
    setTimeout(
      () =>
        document
          .getElementById("advice")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const advice = useMemo<Advice[]>(() => {
    const items: Advice[] = [];
    if (outdoorC !== null && Number.isFinite(outdoorC)) {
      if (outdoorC <= indoorC - 1) {
        items.push({
          icon: "↗",
          title: "Open your windows",
          reason: `It’s ${Math.max(1, Math.round(indoorC - outdoorC))}° cooler outside.`,
          detail:
            "Open windows on opposite sides if safe, so cooler air can move through the home.",
        });
        items.push({
          icon: "◎",
          title: "Help the hot air out",
          reason: "Put a fan near an open window, facing out.",
          detail:
            "This can help move warm indoor air outside while cooler air enters elsewhere.",
        });
      } else {
        items.push({
          icon: "×",
          title: "Keep windows closed for now",
          reason: `Outside is ${Math.max(1, Math.round(outdoorC - indoorC))}° warmer.`,
          detail:
            "Opening windows now can bring hotter air into a cooler room. Open them when outside cools down.",
        });
        items.push({
          icon: "◐",
          title: "Block direct sunlight",
          reason: "Stop the heat before it enters.",
          detail:
            "Close blinds or curtains on sunny windows. External shade works even better.",
        });
      }
    } else {
      items.push({
        icon: "◐",
        title: "Block direct sunlight",
        reason: "Sun through glass quickly heats a room.",
        detail: "Close blinds or curtains on windows receiving direct sun.",
      });
      items.push({
        icon: "?",
        title: "Check outside before opening up",
        reason: "Only open windows if it feels cooler outside.",
        detail:
          "When outdoor air is hotter, open windows can make the room warmer.",
      });
    }
    if (indoorC >= 24)
      items.push({
        icon: "≈",
        title: "Cool yourself too",
        reason: "A fan and cool water can bring faster relief.",
        detail:
          "Wet your skin, use a fan, wear loose clothing, drink regularly, and slow down.",
      });
    return items.slice(0, 3);
  }, [indoorC, outdoorC]);

  const tonight = useMemo(() => {
    if (!weather) return null;
    const now = weather.observedAt;
    const index = weather.hourlyTime.findIndex(
      (time, i) =>
        new Date(time).getTime() > now && weather.hourlyTemp[i] < indoorC - 0.5,
    );
    return index < 0
      ? null
      : new Date(weather.hourlyTime[index]).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
  }, [weather, indoorC]);

  return (
    <main className="min-h-screen bg-[#f4fbf9] text-[#173c3a]">
      <SiteHeader active="tool" />
      <section
        id="top"
        className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-24"
      >
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#47a78e]" /> Simple,
            practical cooling advice
          </p>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-7xl">
            Hot room?
            <br />
            Let’s fix that.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-7 text-[#52716e]">
            Tell us one number. We’ll give you clear actions for now and
            tonight.
          </p>
          <div className="mt-8 hidden gap-6 text-sm font-semibold text-[#52716e] sm:flex">
            <span>✓ No sign-up</span>
            <span>✓ Weather-aware</span>
            <span>✓ Evidence-backed</span>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(28,92,83,.12)] sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#68918a]">
              Your room
            </p>
            <div
              className="flex rounded-full bg-[#eef7f5] p-1 text-xs font-bold"
              aria-label="Temperature unit"
            >
              <button
                type="button"
                onClick={() => setUnit("C")}
                className={`rounded-full px-3 py-1.5 ${unit === "C" ? "bg-[#173c3a] text-white" : ""}`}
                aria-pressed={unit === "C"}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit("F")}
                className={`rounded-full px-3 py-1.5 ${unit === "F" ? "bg-[#173c3a] text-white" : ""}`}
                aria-pressed={unit === "F"}
              >
                °F
              </button>
            </div>
          </div>
          <label
            className="mt-5 block text-2xl font-bold"
            htmlFor="temperature"
          >
            How hot is it?
          </label>
          <div className="mt-4 flex items-center rounded-2xl border-2 border-[#b9d9d2] bg-[#f8fcfb] px-5 focus-within:border-[#267969]">
            <input
              id="temperature"
              required
              type="number"
              min={unit === "C" ? -20 : -4}
              max={unit === "C" ? 60 : 140}
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="min-w-0 flex-1 bg-transparent py-5 text-4xl font-bold outline-none"
              aria-label={`Indoor temperature in degrees ${unit === "C" ? "Celsius" : "Fahrenheit"}`}
            />
            <span className="text-2xl font-bold text-[#52716e]">°{unit}</span>
          </div>
          <label
            className="mt-5 block text-sm font-semibold text-[#52716e]"
            htmlFor="humidity"
          >
            Humidity <span className="font-normal">— optional</span>
          </label>
          <div className="mt-2 flex items-center rounded-xl border border-[#cfe2de] px-4 focus-within:border-[#267969]">
            <input
              id="humidity"
              type="number"
              min="0"
              max="100"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              placeholder="e.g. 60"
              className="min-w-0 flex-1 bg-transparent py-3 outline-none"
            />
            <span>%</span>
          </div>
          <button className="mt-5 w-full rounded-xl bg-[#ef6b4a] px-5 py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(239,107,74,.25)] hover:bg-[#df5b3d] focus:outline-none focus:ring-4 focus:ring-[#f7c2b4]">
            Show me what to do →
          </button>
          <p className="mt-4 text-center text-xs text-[#74908c]">
            No account. No questionnaire. Just useful advice.
          </p>
        </form>
      </section>

      {submitted && (
        <section
          id="advice"
          className="border-y border-[#d5e8e3] bg-white px-5 py-16 sm:px-8"
          aria-live="polite"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.15em] text-[#ef6b4a]">
                  Do this now
                </p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-[-.045em]">
                  Your quickest wins
                </h2>
              </div>
              <div className="rounded-2xl bg-[#f4fbf9] px-5 py-3 text-sm">
                <strong>Inside {showTemp(indoorC, unit)}</strong>
                {outdoorC !== null && Number.isFinite(outdoorC) ? (
                  <span className="text-[#52716e]">
                    {" "}
                    · Outside {showTemp(outdoorC, unit)}
                  </span>
                ) : (
                  <span className="text-[#52716e]"> · Add outside weather</span>
                )}
              </div>
            </div>
            {!weather && (
              <div className="mt-8 rounded-2xl border border-[#cfe2de] bg-[#f8fcfb] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">Make this advice weather-aware</p>
                    <p className="mt-1 text-sm text-[#52716e]">
                      Your approximate location is sent to Open-Meteo to
                      retrieve the forecast. We don’t store it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchWeather}
                    disabled={loading}
                    className="rounded-xl bg-[#267969] px-5 py-3 font-bold text-white disabled:opacity-60"
                  >
                    {loading ? "Checking weather…" : "Use my location"}
                  </button>
                </div>
                {weatherError && (
                  <div className="mt-4 border-t border-[#d5e8e3] pt-4">
                    <p className="mb-2 text-sm text-[#8a4938]">
                      {weatherError}
                    </p>
                    <label className="text-sm font-bold" htmlFor="outdoor">
                      Outdoor temperature
                    </label>
                    <div className="mt-2 flex max-w-xs items-center rounded-xl border border-[#b9d9d2] bg-white px-4">
                      <input
                        id="outdoor"
                        type="number"
                        value={outdoorManual}
                        onChange={(e) => setOutdoorManual(e.target.value)}
                        className="min-w-0 flex-1 py-3 outline-none"
                      />
                      <span>°{unit}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {weather && (
              <p className="mt-7 text-sm font-semibold text-[#52716e]">
                ● Live conditions: {showTemp(weather.temperature, unit)},{" "}
                {weather.humidity}% humidity
              </p>
            )}
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {advice.map((item, index) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#d5e8e3] p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff2ed] text-xl font-bold text-[#267969]">
                      {item.icon}
                    </span>
                    <span className="text-sm font-bold text-[#91aaa5]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 font-semibold text-[#52716e]">
                    {item.reason}
                  </p>
                  <details className="mt-5 border-t border-[#e1eeeb] pt-4 text-sm text-[#52716e]">
                    <summary className="cursor-pointer font-bold text-[#267969]">
                      Why this works
                    </summary>
                    <p className="mt-3 leading-6">{item.detail}</p>
                  </details>
                </article>
              ))}
            </div>
            {humidity !== "" && Number(humidity) >= 65 && (
              <div className="mt-6 rounded-2xl bg-[#fff5e8] p-5">
                <p className="font-bold">Humidity is making this feel worse</p>
                <p className="mt-1 text-sm text-[#765f43]">
                  At {humidity}% humidity, sweat evaporates less easily. A fan
                  can help, but keep drinking and cool your skin with water.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {submitted && (
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <article className="rounded-[28px] bg-[#173c3a] p-7 text-white sm:p-9">
              <p className="text-sm font-bold uppercase tracking-[.15em] text-[#8fd0c0]">
                Tonight
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-.04em]">
                Let the cooler air in.
              </h2>
              <p className="mt-5 text-lg text-[#d5e8e3]">
                {tonight ? (
                  <>
                    Outside should fall below your room temperature at about{" "}
                    <strong className="text-white">{tonight}</strong>. Open
                    windows then, if safe.
                  </>
                ) : (
                  <>
                    Check outside after sunset. When it feels cooler than
                    indoors, open windows on opposite sides.
                  </>
                )}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#d5e8e3]">
                <li>✓ Cool the bedroom before you need to sleep</li>
                <li>✓ Put a fan by a window to move hot air out</li>
                <li>✓ Use lighter bedding and keep water nearby</li>
              </ul>
            </article>
            <article className="rounded-[28px] border border-[#cfe2de] bg-white p-7 sm:p-9">
              <p className="text-sm font-bold uppercase tracking-[.15em] text-[#ef6b4a]">
                Cool the person
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-.04em]">
                Relief doesn’t need to wait.
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm font-bold">
                <span className="rounded-xl bg-[#f4fbf9] p-4">
                  💧 Cool water on skin
                </span>
                <span className="rounded-xl bg-[#f4fbf9] p-4">⌁ Use a fan</span>
                <span className="rounded-xl bg-[#f4fbf9] p-4">
                  🥛 Drink regularly
                </span>
                <span className="rounded-xl bg-[#f4fbf9] p-4">◌ Slow down</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#52716e]">
                Fans cool people through air movement; they do not lower the
                temperature of a closed room. Move to a cooler place if you can.
              </p>
            </article>
          </div>
        </section>
      )}

      {submitted && weather && (
        <CoolingForecast
          indoorC={indoorC}
          times={weather.hourlyTime}
          temperatures={weather.hourlyTemp}
          unit={unit}
          now={weather.observedAt}
        />
      )}

      <section id="safety" className="bg-[#fff1ed] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.15em] text-[#c34d33]">
            Heat safety
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-.045em]">
            Know when heat is more than uncomfortable.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#6f554f]">
            This site cannot diagnose you. Check on older people, young
            children, people with long-term conditions, and anyone who lives
            alone.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl bg-white p-6">
              <h3 className="text-xl font-bold">Heat exhaustion</h3>
              <p className="mt-2 text-sm leading-6 text-[#6f554f]">
                Headache, dizziness, nausea, heavy sweating, thirst, cramps, or
                weakness can be warning signs.
              </p>
              <p className="mt-4 font-bold">
                Move somewhere cool, remove extra clothing, cool the skin, and
                give fluids if the person can drink.
              </p>
              <a
                href="https://www.nhs.uk/conditions/heat-exhaustion-heatstroke/"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block font-bold text-[#267969] underline underline-offset-4"
              >
                Read NHS guidance ↗
              </a>
            </article>
            <article className="rounded-2xl bg-[#a93d2d] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#ffd2ca]">
                Medical emergency
              </p>
              <h3 className="mt-2 text-xl font-bold">Possible heatstroke</h3>
              <p className="mt-2 text-sm leading-6 text-[#ffe5df]">
                Confusion, loss of coordination, seizure, loss of consciousness,
                very high temperature, hot skin that may not be sweating, or
                severe breathing difficulty need urgent help.
              </p>
              <p className="mt-4 font-bold">
                Call emergency services now. Cool the person while waiting and
                follow the call handler’s instructions.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.15em] text-[#267969]">
                Long term
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-.045em]">
                Make the next hot day easier.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  "Shade the glass first",
                  "External shutters, awnings, or shade are strongest. Curtains and blinds still help, especially when closed early.",
                ],
                [
                  "Improve night ventilation",
                  "Create a safe route for air across the home. Secure window restrictors may help where appropriate.",
                ],
                [
                  "Choose the right fan",
                  "A simple, quiet fan can improve comfort. Use it across people or to support cooler outdoor airflow.",
                ],
                [
                  "Consider active cooling",
                  "For repeated severe overheating, get advice on an efficient heat pump or air conditioner sized for the space.",
                ],
              ].map(([title, copy]) => (
                <details key={title} className="rounded-2xl bg-[#f4fbf9] p-5">
                  <summary className="cursor-pointer font-bold">
                    {title}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[#52716e]">
                    {copy}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d5e8e3] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-[#52716e] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-[#173c3a]">
              How to cool down<span className="text-[#ef6b4a]">.</span>
            </p>
            <p className="mt-1">Action first. Explanation optional.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <a
              className="underline underline-offset-4"
              href="https://www.gov.uk/government/publications/beat-the-heat-hot-weather-advice"
              target="_blank"
              rel="noreferrer"
            >
              UKHSA guidance ↗
            </a>
            <a
              className="underline underline-offset-4"
              href="https://www.nhs.uk/conditions/heat-exhaustion-heatstroke/"
              target="_blank"
              rel="noreferrer"
            >
              NHS heat safety ↗
            </a>
            <a
              className="underline underline-offset-4"
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
            >
              Weather by Open-Meteo ↗
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
