(function(root){
  const HIGH='Highest rated (district maximum)';
  function isHighest(label){return String(label||'').startsWith('Highest rated (district maximum)')}
  function getDistricts(records){return [...new Set(records.map(r=>r.district))].sort()}
  function getHubOptions(records,district){return records.filter(r=>r.district===district&&isHighest(r.rating_cluster)).sort((a,b)=>Number(b.hub_heuristic_score||0)-Number(a.hub_heuristic_score||0)||a.original_name.localeCompare(b.original_name))}
  function getLocated(records,district){return records.filter(r=>(!district||r.district===district)&&r.latitude&&r.longitude)}
  function getSpokes(records,district,hubId){return records.filter(r=>r.district===district&&r.id!==hubId).sort((a,b)=>a.original_name.localeCompare(b.original_name))}
  function mapsSearchUrl(record){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(record.original_name+', '+record.district+', Bihar, India')}
  function directionsUrl(hub,stops,mode){if(!hub)throw new Error('Choose a hub first.');if(!stops.length)throw new Error('Select at least one spoke institution.');if(stops.length>8)throw new Error('Choose up to 8 spoke institutions per Google Maps route.');const place=r=>r.original_name+', '+r.district+', Bihar, India';const dest=stops[stops.length-1];const p=new URLSearchParams({api:'1',origin:place(hub),destination:place(dest),travelmode:mode==='transit'?'transit':'driving'});if(stops.length>1)p.set('waypoints',stops.slice(0,-1).map(place).join('|'));return 'https://www.google.com/maps/dir/?'+p.toString()}
  function networkNodes(spokes,width=900,height=620){const cx=width/2,cy=height/2+8,n=spokes.length,perRing=12;return spokes.map((record,i)=>{const ring=Math.floor(i/perRing),slot=i%perRing,count=Math.min(perRing,n-ring*perRing),angle=-Math.PI/2+(2*Math.PI*slot/count);const radius=ring===0?145:ring===1?225:Math.min(300,280+(ring-2)*60);return {record,x:cx+radius*Math.cos(angle),y:cy+radius*Math.sin(angle),index:i+1}})}
  function osrmRouteUrl(hub,stops){if(!hub||!stops||!stops.length)return null;const pts=[hub,...stops].filter(r=>r&&r.latitude&&r.longitude);if(pts.length<2)return null;const coords=pts.map(r=>`${Number(r.longitude).toFixed(6)},${Number(r.latitude).toFixed(6)}`).join(';');return `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`}
  function formatDistance(meters){if(meters==null||isNaN(meters))return'—';if(meters<1000)return`${Math.round(meters)} m`;return`${(meters/1000).toFixed(1)} km`}
  function formatDuration(seconds){if(seconds==null||isNaN(seconds))return'—';const mins=Math.round(seconds/60);if(mins<60)return`${mins} min${mins===1?'':'s'}`;const hrs=Math.floor(mins/60);const remMins=mins%60;return remMins>0?`${hrs} hr ${remMins} min`:`${hrs} hr`}
  const api={HIGH,isHighest,getDistricts,getHubOptions,getLocated,getSpokes,mapsSearchUrl,directionsUrl,networkNodes,osrmRouteUrl,formatDistance,formatDuration};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.ShuruKarCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
