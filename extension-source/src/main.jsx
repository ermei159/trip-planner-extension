import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapPin, Compass, Bookmark, Plus, Share2, CloudSun, ChevronDown, ChevronRight, Clock3, Utensils, TrainFront, MoreHorizontal, ArrowUpRight, Check, Search, Menu, X, Pencil, Trash2 } from 'lucide-react';
import './styles.css';

const days = [
  { label: '西湖与古寺', date: '10月15日 · 周四', weather: '多云转小雨', temp: '19°—25°', spots: [
    { time: '09:00', name: '灵隐寺', detail: '法云弄1号 · 建议停留 2 小时', tag: '历史古迹', type: 'temple', x: 26, y: 28 },
    { time: '12:00', name: '午餐 · 老杭帮菜', detail: '湖滨一带 · 东坡肉、龙井虾仁', tag: '当地美食', type: 'food', x: 45, y: 46 },
    { time: '14:00', name: '岳王庙', detail: '北山街80号 · 建议停留 1 小时', tag: '历史古迹', type: 'temple', x: 54, y: 30 },
    { time: '15:30', name: '断桥残雪', detail: '北山街 · 西湖北岸漫步', tag: '西湖风景', type: 'lake', x: 70, y: 38 },
    { time: '17:00', name: '雷峰塔', detail: '南山路15号 · 傍晚登塔赏湖景', tag: '历史古迹', type: 'temple', x: 61, y: 76 },
  ]},
  { label: '老城与街巷', date: '10月16日 · 周五', weather: '小雨转阴', temp: '20°—27°', spots: [
    { time: '09:30', name: '胡雪岩旧居', detail: '元宝街18号 · 晚清宅邸', tag: '历史古迹', type: 'temple', x: 32, y: 35 },
    { time: '12:00', name: '午餐 · 高银街', detail: '本地杭帮菜与时令河鲜', tag: '当地美食', type: 'food', x: 50, y: 50 },
    { time: '14:00', name: '河坊街', detail: '清河坊历史街区 · 老字号与巷弄', tag: '历史街区', type: 'lake', x: 55, y: 37 },
    { time: '16:30', name: '吴山广场', detail: '登城隍阁俯瞰杭州老城', tag: '城市漫步', type: 'lake', x: 71, y: 62 },
  ]},
  { label: '运河人文', date: '10月17日 · 周六', weather: '晴', temp: '22°—31°', spots: [
    { time: '09:30', name: '武林门码头', detail: '环城北路226号 · 沿运河向北', tag: '京杭大运河', type: 'lake', x: 36, y: 28 },
    { time: '11:00', name: '大兜路历史街区', detail: '老仓库、香积寺与运河街巷', tag: '历史街区', type: 'temple', x: 52, y: 47 },
    { time: '13:00', name: '午餐 · 运河边', detail: '大兜路杭帮菜馆 · 慢享午餐', tag: '当地美食', type: 'food', x: 64, y: 55 },
    { time: '15:00', name: '拱宸桥', detail: '京杭大运河杭州段标志古桥', tag: '历史古迹', type: 'temple', x: 72, y: 34 },
    { time: '16:00', name: '桥西历史街区', detail: '沿河散步，参观老街与博物馆群', tag: '历史街区', type: 'lake', x: 62, y: 72 },
  ]},
];

function MapCanvas({ spots, selected, onSelect, day }) {
  const [zoom,setZoom]=useState(1);
  const mapDay=Math.min(day,2);
  const mapCopy = [
    ['西湖','北山街','南山路','灵隐路'],
    ['上城区','河坊街','中山中路','吴山路'],
    ['京杭大运河','大兜路','桥弄街','拱宸桥'],
  ][mapDay];
  return <div className={`map-canvas map-day-${day}`} aria-label="当天景点路线示意图">
    <div className="map-surface" style={{transform:`scale(${zoom})`}}>
    <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {mapDay===0?<><path className="water" d="M-5 8 C18 24 8 39 27 49 C44 58 30 70 48 80 C62 88 56 101 76 105 L105 105 L105 -5 L-5 -5Z"/><path className="shore" d="M-5 8 C18 24 8 39 27 49 C44 58 30 70 48 80 C62 88 56 101 76 105"/><path className="road" d="M4 86 C25 68 40 83 55 66 S80 51 99 16"/><path className="road thin" d="M2 18 C22 34 37 24 52 44 S77 67 96 81"/></>:mapDay===1?<><path className="water city-river" d="M86 -5 C73 18 84 31 69 47 S65 79 49 105 L105 105 L105 -5Z"/><path className="road city-road" d="M2 15 L82 88 M-3 38 L73 99 M20 -4 L89 69 M2 68 L70 8 M18 103 L98 25 M45 105 L100 63"/><path className="road thin" d="M2 24 L93 24 M5 51 L92 51 M12 77 L88 77"/></>:<><path className="water canal" d="M45 -5 C35 10 52 21 43 34 S54 53 45 66 S56 84 47 105 L72 105 C78 85 65 79 74 65 S66 48 78 33 S63 15 74 -5Z"/><path className="shore" d="M44 -5 C34 10 51 21 42 34 S53 53 44 66 S55 84 46 105"/><path className="road" d="M3 16 L39 20 M74 27 L98 23 M5 55 L43 52 M74 61 L98 67 M8 90 L49 83 M71 92 L98 85"/><path className="road thin" d="M10 3 L12 96 M88 4 L84 96"/></>}
      <path className="route-shadow" d={spots.map((s,i)=>`${i?'L':'M'} ${s.x} ${s.y}`).join(' ')}/>
      <path className="route" d={spots.map((s,i)=>`${i?'L':'M'} ${s.x} ${s.y}`).join(' ')}/>
    </svg>
    <span className="map-label label-lake">{mapCopy[0]}</span><span className="map-label label-north">{mapCopy[1]}</span><span className="map-label label-south">{mapCopy[2]}</span><span className="map-label label-west">{mapCopy[3]}</span>
    {spots.map((spot,i)=><button key={spot.id||spot.name} className={`map-pin ${selected===i?'active':''} ${spot.type}`} style={{left:`${spot.x}%`,top:`${spot.y}%`}} onClick={()=>onSelect(i)} aria-label={`查看${spot.name}`}><span>{i+1}</span></button>)}
    </div>
    <div className="map-controls"><button aria-label="放大" onClick={()=>setZoom(z=>Math.min(1.45,z+.15))}>＋</button><button aria-label="缩小" onClick={()=>setZoom(z=>Math.max(1,z-.15))}>−</button><button className="locate" aria-label="重置地图" onClick={()=>setZoom(1)}><Compass size={16}/></button></div>
    <div className="map-attribution">行程示意图</div>
  </div>
}

function makeId(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function makeBlankDay(i){return {label:'第'+(i+1)+'天',date:'第'+(i+1)+'天 · 日期待定',weather:'待查询',temp:'--',spots:[]}}
const defaultTrips=[
  {id:'hangzhou',title:'杭州，三日慢游',origin:'大连',focus:'历史与美食',days:days.map((d,di)=>({...d,spots:d.spots.map((s,si)=>({...s,id:'hz-'+di+'-'+si}))}))},
  {id:'kyoto',title:'京都秋日散步',origin:'',focus:'城市漫步',days:[makeBlankDay(0)]}
];
function loadTrips(){
  try{const saved=JSON.parse(localStorage.getItem('xingjian-trips')||'null');if(Array.isArray(saved)&&saved.length)return saved}catch{}
  return defaultTrips;
}

function PlannerDialog({dialog,onClose,onSave}){
  const initial=dialog.type==='create'?{title:'',origin:'',focus:'历史与美食',dayCount:3}:dialog.type==='editTrip'?{title:dialog.trip.title,origin:dialog.trip.origin||'',focus:dialog.trip.focus||'',dayLabels:dialog.trip.days.map(d=>d.label).join('\n')}:{name:dialog.spot.name,time:dialog.spot.time,detail:dialog.spot.detail,tag:dialog.spot.tag,type:dialog.spot.type};
  const [form,setForm]=useState(initial);
  const change=(key,value)=>setForm(old=>({...old,[key]:value}));
  useEffect(()=>{const esc=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[onClose]);
  const isSpot=dialog.type==='editSpot';
  const title=dialog.type==='create'?'创建新行程':dialog.type==='editTrip'?'编辑行程':'编辑地点';
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="planner-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header><div><small>行间 · 行程工作台</small><h2 id="dialog-title">{title}</h2></div><button type="button" className="dialog-close" onClick={onClose} aria-label="关闭"><X size={19}/></button></header><form onSubmit={e=>{e.preventDefault();onSave(form)}}><div className="dialog-fields">
    {isSpot?<><label>地点名称<input required autoFocus maxLength="40" value={form.name} onChange={e=>change('name',e.target.value)} placeholder="例如：灵隐寺"/></label><div className="dialog-row"><label>到达时间<input type="time" value={form.time} onChange={e=>change('time',e.target.value)}/></label><label>地点类型<select value={form.type} onChange={e=>change('type',e.target.value)}><option value="temple">历史景点</option><option value="lake">街区 / 风景</option><option value="food">美食停留</option></select></label></div><label>地址与备注<textarea rows="3" value={form.detail} onChange={e=>change('detail',e.target.value)} placeholder="地址、建议停留时间等"/></label><label>标签<input maxLength="20" value={form.tag} onChange={e=>change('tag',e.target.value)} placeholder="例如：历史古迹"/></label></>
    :<><label>行程名称<input required autoFocus maxLength="40" value={form.title} onChange={e=>change('title',e.target.value)} placeholder="例如：杭州周末慢游"/></label><div className="dialog-row"><label>出发地<input maxLength="30" value={form.origin} onChange={e=>change('origin',e.target.value)} placeholder="例如：大连"/></label><label>旅行主题<input maxLength="30" value={form.focus} onChange={e=>change('focus',e.target.value)} placeholder="历史与美食"/></label></div>{dialog.type==='create'?<label>行程天数<select value={form.dayCount} onChange={e=>change('dayCount',Number(e.target.value))}>{[1,2,3,4,5,6,7].map(n=><option value={n} key={n}>{n} 天</option>)}</select></label>:<label>每天的标题<textarea rows="4" value={form.dayLabels} onChange={e=>change('dayLabels',e.target.value)} placeholder="每行填写一天的标题"/><small className="field-help">每行对应一天，可修改每天的名称。</small></label>}</>}
    </div><footer><button type="button" className="dialog-cancel" onClick={onClose}>取消</button><button type="submit" className="dialog-save">保存</button></footer></form></section></div>
}

function App(){
  const [trips,setTrips]=useState(loadTrips);
  const [tripId,setTripId]=useState(()=>loadTrips()[0]?.id||'hangzhou');
  const [dayIndex,setDayIndex]=useState(0);
  const [selected,setSelected]=useState(0);
  const [saved,setSaved]=useState(false);
  const [notice,setNotice]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const [adding,setAdding]=useState(false);
  const [mapOpen,setMapOpen]=useState(false);
  const [dialog,setDialog]=useState(null);
  const trip=trips.find(t=>t.id===tripId)||trips[0];
  const day=Math.min(dayIndex,trip.days.length-1);
  const current=trip.days[day];
  const displaySpots=current.spots||[];
  function notify(message){setNotice(message);window.clearTimeout(notify.timer);notify.timer=window.setTimeout(()=>setNotice(''),2300)}
  function persist(next,message){setTrips(next);try{localStorage.setItem('xingjian-trips',JSON.stringify(next))}catch{}if(message)notify(message)}
  function chooseTrip(id){setTripId(id);setDayIndex(0);setSelected(0);setAdding(false);setMenuOpen(false)}
  function chooseDay(i){setDayIndex(i);setSelected(0);setAdding(false)}
  function updateTrip(id,updater,message){persist(trips.map(t=>t.id===id?updater(t):t),message)}
  function updateDay(dayNo,updater,message){updateTrip(trip.id,t=>({...t,days:t.days.map((d,i)=>i===dayNo?updater(d):d)}),message)}
  function addPlace(name,detail){
    const spot={id:makeId(),time:'18:00',name,detail,tag:'顺路推荐',type:'lake',x:68+(displaySpots.length%3)*7,y:74+(displaySpots.length%2)*7};
    updateDay(day,d=>({...d,spots:[...d.spots,spot]}),name+'已加入行程');setSelected(displaySpots.length);setAdding(false);
  }
  function saveDialog(form){
    if(dialog.type==='create'){
      const count=Math.max(1,Math.min(7,Number(form.dayCount)||1));
      const created={id:makeId(),title:form.title.trim(),origin:form.origin.trim(),focus:form.focus.trim()||'自由探索',days:Array.from({length:count},(_,i)=>makeBlankDay(i))};
      const next=[created,...trips];persist(next,'新行程已创建');setTripId(created.id);setDayIndex(0);setSelected(0);
    }else if(dialog.type==='editTrip'){
      const labels=form.dayLabels.split('\n').map(s=>s.trim());
      updateTrip(trip.id,t=>({...t,title:form.title.trim(),origin:form.origin.trim(),focus:form.focus.trim(),days:t.days.map((d,i)=>({...d,label:labels[i]||d.label}))}),'行程信息已保存');
    }else if(dialog.type==='editSpot'){
      updateDay(day,d=>({...d,spots:d.spots.map(s=>s.id===dialog.spot.id?({...s,...form,name:form.name.trim(),detail:form.detail.trim(),tag:form.tag.trim()}):s)}),'地点信息已保存');
    }
    setDialog(null);
  }
  function removeSpot(spot){
    updateDay(day,d=>({...d,spots:d.spots.filter(s=>s.id!==spot.id)}),'已删除 '+spot.name);
    setSelected(i=>Math.max(0,Math.min(i,displaySpots.length-2)));
  }
  function share(){if(navigator.clipboard)navigator.clipboard.writeText(window.location.href).then(()=>notify('页面链接已复制')).catch(()=>notify('当前浏览器不支持复制'));else notify('当前浏览器不支持复制')}
  const dateSummary=current.date.includes('·')?current.date.split('·')[0].trim():current.date;
  const foodSummary=displaySpots.find(s=>s.type==='food');
  return <div className="app-shell">
    <aside className={'sidebar '+(menuOpen?'open':'')}>
      <a className="brand" href="#top"><span className="brand-mark">行</span><span>行间</span></a>
      <div className="side-label">工作空间</div>
      <nav className="main-nav"><button className="nav-item selected"><Compass size={18}/><span>我的行程</span><span className="nav-count">{trips.length}</span></button><button className="nav-item" onClick={()=>notify('灵感推荐即将开放')}><Search size={18}/><span>发现灵感</span></button><button className="nav-item" onClick={()=>notify('请在行程中点击书签收藏')}><Bookmark size={18}/><span>收藏夹</span></button></nav>
      <div className="side-separator"/><div className="side-label">最近计划</div>
      {trips.map((t,i)=><button key={t.id} className={'recent-trip '+(t.id===trip.id?'current-trip':'')} onClick={()=>chooseTrip(t.id)}><span className={'trip-dot '+(i%2?'dot-blue':'')}/><span><b>{t.title}</b><small>{t.days.length} 天 · {t.origin?t.origin+'出发':'未填写出发地'}</small></span></button>)}
      <button className="new-trip" onClick={()=>setDialog({type:'create'})}><Plus size={16}/> 创建新行程</button>
      <div className="sidebar-bottom"><div className="avatar">林</div><div><b>我的行程</b><small>保存在此浏览器</small></div><MoreHorizontal size={18}/></div>
    </aside>
    {menuOpen&&<button className="scrim" onClick={()=>setMenuOpen(false)} aria-label="关闭菜单"/>}
    <main id="top" className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={()=>setMenuOpen(!menuOpen)} aria-label="打开菜单">{menuOpen?<X size={20}/>:<Menu size={20}/>}</button><div className="breadcrumbs">我的行程 <ChevronRight size={14}/> <span>{trip.title}</span></div><div className="top-actions"><button className={'icon-button save-button '+(saved?'is-saved':'')} onClick={()=>setSaved(!saved)} aria-label={saved?'取消收藏':'收藏行程'}><Bookmark size={17} fill={saved?'currentColor':'none'}/></button><button className="share-button" onClick={share}><Share2 size={15}/>分享行程</button></div></header>
      <div className="content-wrap">
        <section className="trip-heading"><div><h1>{trip.title}</h1><div className="trip-meta"><span><Clock3 size={15}/>{trip.days.length} 天行程</span><i/><span><MapPin size={15}/>{trip.origin?trip.origin+'出发':'出发地待填写'}</span><i/><span>{trip.focus||'自由探索'}</span></div></div><button className="edit-button" onClick={()=>setDialog({type:'editTrip',trip})}>编辑行程 <Pencil size={14}/></button></section>
        <section className="day-tabs" aria-label="选择游览日期">{trip.days.map((d,i)=><button className={'day-tab '+(day===i?'active':'')} onClick={()=>chooseDay(i)} key={i}><span className="day-number">{String(i+1).padStart(2,'0')}</span><span className="day-tab-copy"><b>{d.label}</b><small>{d.date}</small></span>{day===i&&<span className="tab-marker"/>}</button>)}</section>
        <div className="workspace-grid">
          <section className="itinerary-panel">
            <div className="section-heading"><div><h2>今日路线</h2><p>{current.date} <span>·</span> {displaySpots.length} 个停留点</p></div><button className="more-button" aria-label="添加地点" onClick={()=>setAdding(!adding)}><MoreHorizontal size={20}/></button></div>
            <div className="route-list">{displaySpots.length===0?<p className="empty-route">这一天还没有安排地点，点击下方“添加地点”开始规划。</p>:displaySpots.map((spot,i)=><React.Fragment key={spot.id||spot.name+'-'+i}><div className={'stop-row '+(selected===i?'chosen':'')}><span className="stop-time">{spot.time}</span><span className="timeline"><span className={'stop-marker '+spot.type}>{spot.type==='food'?<Utensils size={13}/>:<span>{i+1}</span>}</span>{i<displaySpots.length-1&&<i className="connector"/>}</span><button className="stop-content" onClick={()=>setSelected(i)}><b>{spot.name}</b><small>{spot.detail}</small></button><span className="stop-tag">{spot.tag}</span><div className="stop-actions"><button type="button" aria-label={'编辑'+spot.name} title="编辑地点" onClick={()=>setDialog({type:'editSpot',spot})}><Pencil size={14}/></button><button type="button" className="delete-stop" aria-label={'删除'+spot.name} title="删除地点" onClick={()=>removeSpot(spot)}><Trash2 size={14}/></button></div></div>{i===1&&<button className="add-stop" onClick={()=>setAdding(!adding)}><Plus size={14}/>添加一个停留点</button>}</React.Fragment>)}</div>
            {adding&&<div className="add-picker"><div>顺路加入</div><button onClick={()=>addPlace('中国茶叶博物馆','龙井路双峰 · 了解杭州茶文化')}>中国茶叶博物馆 <span>历史与茶文化</span></button><button onClick={()=>addPlace(day===2?'香积寺':'城隍阁',day===2?'大兜路 · 运河古寺':'吴山之巅 · 俯瞰老城')}>{day===2?'香积寺':'城隍阁'} <span>附近人文景点</span></button></div>}
            <button className="add-to-route" onClick={()=>setAdding(!adding)}><Plus size={16}/>{adding?'收起推荐':'添加地点'}</button>
            <div className="origin-note"><TrainFront size={16}/><span>{trip.origin||'出发地待填写'}</span><span className="origin-divider"/>{trip.title.split(/[，,：:]/)[0]}行程 · 可在“编辑行程”中修改</div>
          </section>
          <section className="map-section"><div className="map-title"><div><h2>路线地图</h2><p>按地理位置安排游览顺序</p></div><button className="map-expand" aria-label="展开地图" onClick={()=>setMapOpen(true)}><ArrowUpRight size={17}/></button></div><MapCanvas spots={displaySpots} selected={selected} onSelect={setSelected} day={day}/><div className="map-legend"><span><i className="legend-dot history"/>历史景点</span><span><i className="legend-dot food"/>美食停留</span><span className="route-distance">路线顺序</span></div></section>
        </div>
        <section className="lower-grid"><div className="weather-block"><div className="lower-icon weather-icon"><CloudSun size={21}/></div><div><div className="lower-label">{trip.title.split(/[，,：:]/)[0]} · {dateSummary}</div><div className="weather-main">{current.weather}<span>{current.temp}</span></div><small>天气信息为行程备注，可按实际预报调整</small></div></div><div className="food-block"><div className="lower-icon food-icon"><Utensils size={20}/></div><div><div className="lower-label">路上吃什么</div><div className="food-main">{foodSummary?foodSummary.name:'还没有安排美食'}<span>{foodSummary?'当地风味':'可以添加餐馆或小吃'}</span></div><small>{foodSummary?foodSummary.detail:'点击“添加地点”加入一处美食停留'}</small></div></div></section>
        <footer className="page-footer"><span>好风景，慢慢走。</span><button onClick={share}>分享这份行程 <ArrowUpRight size={14}/></button></footer>
      </div>
    </main>
    {mapOpen&&<div className="map-modal" role="dialog" aria-modal="true" aria-label="路线地图"><div className="map-modal-header"><div><b>{current.label} · 路线地图</b><small>{current.date}</small></div><button onClick={()=>setMapOpen(false)} aria-label="关闭地图"><X size={19}/></button></div><MapCanvas spots={displaySpots} selected={selected} onSelect={setSelected} day={day}/></div>}
    {dialog&&<PlannerDialog key={dialog.type+(dialog.spot?.id||dialog.trip?.id||'new')} dialog={dialog} onClose={()=>setDialog(null)} onSave={saveDialog}/>}
    {notice&&<div className="toast"><Check size={16}/>{notice}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
