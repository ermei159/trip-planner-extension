const AMAP_BASE = 'https://restapi.amap.com/v3/';
async function amap(path, params, key) {
  const query = new URLSearchParams({ ...params, key, output: 'JSON' });
  const response = await fetch(AMAP_BASE + path + '?' + query.toString());
  if (!response.ok) throw new Error('高德服务暂时无法连接，请稍后重试。');
  const data = await response.json();
  if (data.status !== '1') {
    const messages = {
      INVALID_USER_KEY: '高德 Key 无效，请检查高德 Web 服务 API Key。',
      INVALID_USER_SCODE: '高德安全校验失败，请检查 Key 的应用类型和安全设置。',
      INVALID_USER_IP: '此 Key 配置了 IP 白名单，当前网络不在允许范围内。',
      DAILY_QUERY_OVER_LIMIT: '高德 API 今日调用次数已达上限。',
      USERKEY_PLAT_NOMATCH: '请使用高德“Web 服务”类型的 Key。',
    };
    throw new Error(messages[data.infocode] || ('高德返回错误：' + (data.info || data.infocode || '未知错误')));
  }
  return data;
}

function distance(a, b) {
  const rad = Math.PI / 180;
  const lat1 = a.lat * rad;
  const lat2 = b.lat * rad;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function coordinates(poi) {
  const [lon, lat] = String(poi.location || '').split(',').map(Number);
  return Number.isFinite(lon) && Number.isFinite(lat) ? { lon, lat } : null;
}

function nearestOrder(places, center) {
  const pending = places.slice();
  const ordered = [];
  let point = center || coordinates(pending[0] || {});
  while (pending.length) {
    let best = 0;
    if (point) {
      for (let i = 1; i < pending.length; i++) {
        if (distance(point, coordinates(pending[i])) < distance(point, coordinates(pending[best]))) best = i;
      }
    }
    const next = pending.splice(best, 1)[0];
    ordered.push(next);
    point = coordinates(next);
  }
  return ordered;
}

async function search(city, keyword, key) {
  const data = await amap('place/text', {
    keywords: keyword,
    city,
    citylimit: 'true',
    offset: '20',
    page: '1',
    extensions: 'all',
  }, key);
  return (data.pois || []).map(poi => ({ ...poi, _searchKeyword: keyword })).filter(poi => coordinates(poi));
}

function makeDate(date, index) {
  const value = new Date(date + 'T12:00:00');
  value.setDate(value.getDate() + index);
  const week = ['日', '一', '二', '三', '四', '五', '六'][value.getDay()];
  return value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' +
    String(value.getDate()).padStart(2, '0') + ' · 周' + week;
}

function mapPositions(places) {
  const coords = places.map(coordinates);
  const longitudes = coords.map(p => p.lon);
  const latitudes = coords.map(p => p.lat);
  const minLon = Math.min(...longitudes), maxLon = Math.max(...longitudes);
  const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes);
  return places.map((poi, index) => {
    const point = coords[index];
    const x = maxLon === minLon ? 50 : 13 + (point.lon - minLon) / (maxLon - minLon) * 74;
    const y = maxLat === minLat ? 50 : 14 + (maxLat - point.lat) / (maxLat - minLat) * 72;
    return { ...poi, x, y };
  });
}

async function legBetween(origin, destination, mode, key) {
  try {
    const route = await amap('direction/' + (mode === 'driving' ? 'driving' : 'walking'), {
      origin: origin.location,
      destination: destination.location,
    }, key);
    const path = route.route?.paths?.[0];
    if (!path) return '';
    const meters = Number(path.distance);
    const minutes = Math.max(1, Math.round(Number(path.duration) / 60));
    return (mode === 'driving' ? '驾车' : '步行') + '约' +
      (meters >= 1000 ? (meters / 1000).toFixed(1) + ' 公里' : meters + ' 米') +
      ' · ' + minutes + ' 分钟';
  } catch {
    return '';
  }
}

async function generateRoute(trip, key) {
  const city = trip.destination.trim();
  const history = (trip.focus || '').includes('历史');
  const attractionTerms = history ? ['历史景点', '博物馆', '历史街区'] : ['景点', '博物馆', '特色街区'];
  const termResults = await Promise.all([
    ...attractionTerms.map(term => search(city, term, key)),
    search(city, '特色美食', key),
  ]);
  const seen = new Set();
  const attractions = [];
  for (const result of termResults.slice(0, attractionTerms.length)) {
    for (const poi of result) {
      if (!seen.has(poi.id)) {
        seen.add(poi.id);
        attractions.push({ ...poi, _kind: 'place' });
      }
    }
  }
  const foods = [];
  for (const poi of termResults[attractionTerms.length]) {
    if (!seen.has(poi.id)) {
      seen.add(poi.id);
      foods.push({ ...poi, _kind: 'food' });
    }
  }
  const dayCount = Math.max(1, Math.min(7, Number(trip.dayCount) || trip.days.length || 1));
  if (!attractions.length && !foods.length) throw new Error('高德没有找到相关地点，请检查目的地名称后重试。');

  let center = null;
  try {
    const geo = await amap('geocode/geo', { address: city, city }, key);
    const point = String(geo.geocodes?.[0]?.location || '').split(',').map(Number);
    if (point.length === 2 && point.every(Number.isFinite)) center = { lon: point[0], lat: point[1] };
  } catch {}

  const dayPlans = [];
  const attractionPerDay = Math.max(1, Math.ceil(attractions.length / dayCount));
  for (let index = 0; index < dayCount; index++) {
    const dayAttractions = attractions.slice(index * attractionPerDay, (index + 1) * attractionPerDay).slice(0, 4);
    const food = foods[index];
    let ordered = nearestOrder(dayAttractions, center);
    if (food) {
      const lunchIndex = Math.min(2, ordered.length);
      ordered.splice(lunchIndex, 0, food);
    }
    if (!ordered.length && foods[index]) ordered = [foods[index]];
    if (!ordered.length) continue;

    const positioned = mapPositions(ordered);
    const enriched = await Promise.all(positioned.map(async (poi, poiIndex) => {
      const previous = poiIndex > 0 ? positioned[poiIndex - 1] : null;
      const leg = previous ? await legBetween(previous, poi, trip.transportMode, key) : '';
      const address = poi.address || poi.pname + poi.cityname + poi.adname;
      const category = poi._kind === 'food' ? 'food' : (history ? 'temple' : 'lake');
      const times = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00'];
      return {
        id: poi.id || (Date.now() + '-' + index + '-' + poiIndex),
        name: poi.name,
        time: poi._kind === 'food' ? (poiIndex < 2 ? '12:00' : '18:00') : times[poiIndex] || '16:00',
        detail: [address, leg ? '距上一站' + leg : ''].filter(Boolean).join(' · '),
        tag: poi._kind === 'food' ? '高德推荐 · 美食' : '高德推荐 · ' + (poi.type?.split(';')[0] || (history ? '历史景点' : '景点')),
        type: category,
        x: poi.x,
        y: poi.y,
        location: poi.location,
        poiId: poi.id,
      };
    }));
    dayPlans.push({
      label: (index + 1) + '日 · ' + (enriched[0]?.name || '自由探索'),
      date: makeDate(trip.startDate, index),
      weather: '出发前查询',
      temp: '--',
      spots: enriched,
    });
  }
  if (!dayPlans.length) throw new Error('高德找到了地点，但没有足够的信息生成路线。请稍后重试。');
  return dayPlans;
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Trip-Client',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Trip-Client',
      'Access-Control-Max-Age': '86400',
    }});

    const url = new URL(request.url);
    if (url.pathname !== '/api/route') return json({ ok: false, error: '接口不存在。' }, 404);
    if (request.method !== 'POST') return json({ ok: false, error: '请求方式不支持。' }, 405);
    if (!env.AMAP_KEY) return json({ ok: false, error: '路线服务尚未配置高德 Key。' }, 503);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const installationId = request.headers.get('X-Trip-Client') || 'unknown';
    const [ipLimit, clientLimit] = await Promise.all([
      env.IP_RATE_LIMIT.limit({ key: ip }),
      env.CLIENT_RATE_LIMIT.limit({ key: installationId }),
    ]);
    if (!ipLimit.success || !clientLimit.success) {
      return json({ ok: false, error: '请求太频繁，请稍等一分钟再生成路线。' }, 429);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ ok: false, error: '请求内容无效。' }, 400); }

    const trip = body?.trip;
    if (!trip || typeof trip.destination !== 'string' || !trip.destination.trim() || trip.destination.length > 60) {
      return json({ ok: false, error: '请填写有效的目的地城市。' }, 400);
    }
    if (typeof trip.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(trip.startDate)) {
      return json({ ok: false, error: '请填写有效的出发日期。' }, 400);
    }
    const dayCount = Math.max(1, Math.min(7, Number(trip.dayCount) || 1));
    const safeTrip = {
      destination: trip.destination.trim(),
      startDate: trip.startDate,
      dayCount,
      focus: typeof trip.focus === 'string' ? trip.focus.slice(0, 80) : '',
      transportMode: trip.transportMode === 'driving' ? 'driving' : 'walking',
      days: Array.from({ length: dayCount }, (_, index) => ({ spots: [], label: (index + 1) + '日' })),
    };

    try {
      const days = await generateRoute(safeTrip, env.AMAP_KEY);
      return json({ ok: true, days });
    } catch (error) {
      return json({ ok: false, error: error?.message || '路线生成失败，请稍后重试。' }, 502);
    }
  },
};