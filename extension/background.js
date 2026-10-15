const API_CONFIG_URL = 'https://ermei159.github.io/trip-planner-extension/api-config.json';

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('app/index.html') });
});

function getClientId() {
  return new Promise(resolve => chrome.storage.local.get(['tripPlannerClientId'], saved => {
    if (saved.tripPlannerClientId) return resolve(saved.tripPlannerClientId);
    const id = crypto.randomUUID();
    chrome.storage.local.set({ tripPlannerClientId: id }, () => resolve(id));
  }));
}

async function generateRoute(trip) {
  let apiBase;
  try {
    const configResponse = await fetch(API_CONFIG_URL + '?t=' + Date.now(), { cache: 'no-store' });
    const config = await configResponse.json();
    apiBase = String(config.apiBase || '').replace(/\/$/, '');
  } catch {
    return { ok: false, error: '读取路线服务配置失败，请检查网络后重试。' };
  }
  if (!/^https:\/\/[a-z0-9-]+\.workers\.dev$/i.test(apiBase)) {
    return { ok: false, error: '路线服务还在部署配置中，请稍后再试。' };
  }
  const clientId = await getClientId();
  let response;
  try {
    response = await fetch(apiBase + '/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Trip-Client': clientId },
      body: JSON.stringify({ trip }),
    });
  } catch {
    return { ok: false, error: '连接路线服务失败，请检查网络后重试。' };
  }
  let data;
  try { data = await response.json(); }
  catch { return { ok: false, error: '路线服务返回了无效内容，请稍后重试。' }; }
  if (!response.ok || !data.ok) return { ok: false, error: data.error || '路线生成失败，请稍后重试。' };
  return data;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GENERATE_ROUTE') return false;
  generateRoute(message.trip).then(sendResponse).catch(error =>
    sendResponse({ ok: false, error: error.message || '路线生成失败，请稍后重试。' })
  );
  return true;
});
