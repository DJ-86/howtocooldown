'use client';

type Props = { indoorC: number; times: string[]; temperatures: number[]; unit: 'C' | 'F'; now: number };
const displayTemp = (c: number, unit: 'C' | 'F') => `${unit === 'C' ? Math.round(c) : Math.round(c * 9 / 5 + 32)}°${unit}`;
const displayTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function CoolingForecast({ indoorC, times, temperatures, unit, now }: Props) {
  const upcoming = times.map((time, index) => ({ time, temp: temperatures[index], stamp: new Date(time).getTime() })).filter(point => point.stamp >= now).slice(0, 25);
  if (!upcoming.length) return null;
  const openIndex = upcoming.findIndex(point => point.temp <= indoorC - .5);
  const closeIndex = openIndex < 0 ? -1 : upcoming.findIndex((point, index) => index > openIndex && point.temp >= indoorC - .5);
  const coolest = upcoming.reduce((best, point) => point.temp < best.temp ? point : best, upcoming[0]);
  const tomorrowDate = new Date(now); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
  const tomorrow = upcoming.filter(point => point.time.startsWith(tomorrowKey));
  const tomorrowPeak = tomorrow.length ? Math.max(...tomorrow.map(point => point.temp)) : null;
  const todayPoints = upcoming.filter(point => new Date(point.time).getDate() === new Date(now).getDate());
  const todayPeak = todayPoints.length ? Math.max(...todayPoints.map(point => point.temp)) : upcoming[0].temp;
  const samples = upcoming.filter((_, index) => index % 3 === 0).slice(0, 8);
  const floor = Math.min(...samples.map(point => point.temp)) - 1;
  const ceiling = Math.max(indoorC, ...samples.map(point => point.temp)) + 1;

  return <section className="bg-white px-5 py-16 sm:px-8" aria-labelledby="cooling-forecast-title"><div className="mx-auto max-w-6xl">
    <p className="text-sm font-bold uppercase tracking-[.15em] text-[#267969]">Next 24 hours</p>
    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="cooling-forecast-title" className="text-4xl font-extrabold tracking-[-.045em]">Your cooling window</h2><p className="mt-3 max-w-2xl leading-7 text-[#52716e]">Estimated from your room temperature of {displayTemp(indoorC, unit)} and the hourly outdoor forecast.</p></div><span className="w-fit rounded-full bg-[#eef7f5] px-4 py-2 text-sm font-bold text-[#267969]">Forecast estimate</span></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ForecastCard label="Open windows" value={openIndex >= 0 ? displayTime(upcoming[openIndex].time) : 'No clear window'} detail={openIndex >= 0 ? `Outside should be about ${displayTemp(upcoming[openIndex].temp, unit)}` : 'Outside may remain too warm'} /><ForecastCard label="Close again" value={closeIndex >= 0 ? displayTime(upcoming[closeIndex].time) : openIndex >= 0 ? 'Check after sunrise' : 'Not calculated'} detail="Close before warmer air returns" /><ForecastCard label="Coolest outside" value={displayTemp(coolest.temp, unit)} detail={`Expected around ${displayTime(coolest.time)}`} /><ForecastCard label="Tomorrow’s peak" value={tomorrowPeak === null ? 'Not available' : displayTemp(tomorrowPeak, unit)} detail={tomorrowPeak === null ? 'Forecast ends before tomorrow’s peak' : tomorrowPeak > todayPeak + 1 ? 'Likely hotter than today' : tomorrowPeak < todayPeak - 1 ? 'Likely cooler than today' : 'Similar to today'} /></div>
    <div className="mt-8 rounded-2xl border border-[#d5e8e3] bg-[#f8fcfb] p-5"><div className="flex h-40 items-end gap-2" aria-label="Outdoor temperature forecast chart">{samples.map(point => { const height = 24 + ((point.temp - floor) / Math.max(1, ceiling - floor)) * 88; const useful = point.temp <= indoorC - .5; return <div key={point.time} className="flex min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-2 text-xs font-bold">{displayTemp(point.temp, unit).replace(unit, '')}</span><span className={`w-full max-w-12 rounded-t-md ${useful ? 'bg-[#47a78e]' : 'bg-[#ef9a82]'}`} style={{ height }} /><span className="mt-2 text-[11px] text-[#68918a]">{new Date(point.time).toLocaleTimeString([], { hour: 'numeric' })}</span></div>; })}</div><div className="mt-4 flex flex-wrap gap-5 border-t border-[#d5e8e3] pt-4 text-xs font-semibold text-[#52716e]"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#47a78e]" />Useful for ventilation</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ef9a82]" />Warmer than your cooling threshold</span></div></div>
    <p className="mt-5 text-sm leading-6 text-[#68918a]">This is a planning estimate, not an instruction to leave windows unattended. Your room should cool over time, and local conditions can differ from the forecast. Only open windows when safe.</p>
  </div></section>;
}

function ForecastCard({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-2xl border border-[#d5e8e3] p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#68918a]">{label}</p><p className="mt-2 text-2xl font-extrabold tracking-[-.035em]">{value}</p><p className="mt-2 text-sm leading-5 text-[#52716e]">{detail}</p></article>; }
