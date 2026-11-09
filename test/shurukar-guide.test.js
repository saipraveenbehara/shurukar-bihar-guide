const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const C=require('../app-core.js');
const boundaries=require('../district-boundaries.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const embedded=html.match(/const DATA=(\[.*?\]);<\/script>/s);assert.ok(embedded);
const rows=JSON.parse(embedded[1]);

test('preserves all 107 source rows across six districts',()=>{
  assert.equal(rows.length,107);
  assert.deepEqual(C.getDistricts(rows),['Bhagalpur','Darbhanga','Gaya','Madhubani','Muzaffarpur','Patna']);
  assert.ok(rows.every(r=>r.original_name&&r.rating_cluster));
});

test('combines both highest-rated labels in the hub selector, preserving original values',()=>{
  const h=C.getHubOptions(rows,'Patna');
  assert.ok(h.some(r=>r.rating_cluster==='Highest rated (district maximum)'));
  assert.ok(h.some(r=>r.rating_cluster==='Highest rated (district maximum)(M)'));
  assert.equal(C.isHighest('Highest rated (district maximum)(M)'),true);
  assert.equal(C.isHighest('Lower rated (below district maximum)'),false);
});

test('all selected hubs have only same-district spoke records',()=>{
  for(const d of C.getDistricts(rows)){
    const h=C.getHubOptions(rows,d)[0];
    const s=C.getSpokes(rows,d,h.id);
    assert.ok(s.length>0);
    assert.ok(s.every(r=>r.district===d&&r.id!==h.id));
  }
});

test('100 Google Maps matches are plotted and seven unresolved records remain unpinned',()=>{
  const placed=rows.filter(r=>r.latitude&&r.longitude);
  assert.equal(placed.length,100);
  assert.deepEqual(rows.filter(r=>!r.latitude).map(r=>r.id),['BR-021','BR-034','BR-043','BR-048','BR-054','BR-104','BR-105']);
  assert.ok(placed.every(r=>Number.isFinite(+r.latitude)&&Number.isFinite(+r.longitude)));
});

test('Google Maps links point to matched coordinates',()=>{
  const r=rows.find(x=>x.district==='Patna'&&x.latitude);
  const u=new URL(r.google_maps_search_url);
  assert.equal(u.hostname,'www.google.com');
  assert.equal(u.searchParams.get('query'),`${r.latitude},${r.longitude}`);
});

test('route URLs support car/transit, waypoints, and stop limits',()=>{
  const h=C.getHubOptions(rows,'Patna')[0],s=C.getSpokes(rows,'Patna',h.id);
  assert.equal(new URL(C.directionsUrl(h,s.slice(0,2),'driving')).searchParams.get('travelmode'),'driving');
  assert.ok(new URL(C.directionsUrl(h,s.slice(0,2),'driving')).searchParams.get('waypoints'));
  assert.equal(new URL(C.directionsUrl(h,s.slice(0,1),'transit')).searchParams.get('travelmode'),'transit');
  assert.throws(()=>C.directionsUrl(h,[],'driving'),/at least one spoke/);
  assert.throws(()=>C.directionsUrl(h,s.slice(0,9),'driving'),/up to 8/);
});

test('page integrates Leaflet street maps, district boundaries, and responsive controls',()=>{
  assert.equal((html.match(/<select/g)||[]).length,3);
  assert.match(html,/id="map"/);
  assert.match(html,/leaflet/i);
  assert.match(html,/district-boundaries\.js/);
  assert.equal(Object.keys(boundaries).length,6);
});

test('inline scripts parse cleanly',()=>{
  const scripts=[...html.matchAll(/<script(?![^>]*src=)(.*?)<\/script>/gs)].map(x=>x[1].replace(/^[^>]*>/,''));
  assert.ok(scripts.length>=2);
  for(const s of scripts)new Function(s);
});

class El{
  constructor(id){
    this.id=id;this.value='';this.checked=false;this.disabled=false;
    this.textContent='';this.dataset={};this.handlers={};this._html='';
    this.options=[];this.nodes=[];this.attrs={};this.style={};
    this.classList={add:()=>{},remove:()=>{},contains:()=>false};
  }
  set innerHTML(v){
    this._html=v;this.options=[];this.nodes=[];
    for(const m of v.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)){
      this.options.push({value:m[1],label:m[2]});
    }
    if(['district','hub'].includes(this.id)&&this.options.length&&!this.options.some(o=>o.value===this.value)){
      this.value=this.options[0].value;
    }
    if(this.id==='spokeList'){
      for(const m of v.matchAll(/<input type="checkbox" data-check="([^"]+)"([^>]*)>/g)){
        const n=new El('checkbox');
        n.dataset.check=m[1];
        n.checked=/\bchecked\b/.test(m[2]);
        this.nodes.push(n);
      }
    }
  }
  get innerHTML(){return this._html}
  set selectedIndex(i){if(this.options[i])this.value=this.options[i].value}
  addEventListener(t,f){(this.handlers[t]??=[]).push(f)}
  dispatch(t,extra={}){for(const f of this.handlers[t]||[])f({target:this,key:'',preventDefault(){},...extra})}
  querySelectorAll(){return this.nodes}
  querySelector(s){
    const m=s.match(/data-check="([^"]+)"/);
    return m?this.nodes.find(n=>n.dataset.check===m[1])||null:null;
  }
  setAttribute(k,v){this.attrs[k]=v}
  getBoundingClientRect(){return{left:0,top:0,width:920,height:640}}
  setPointerCapture(){}
  closest(){return null}
}

test('simulated district, hub, map-pin, list, and route interactions work',()=>{
  const ids=[
    'district','hub','mode','routeButton','totalCount','mapTitle','mapSubtitle',
    'spokeTitle','pinBadge','unlocated','selectedBadge','spokeList','details',
    'map','zoomIn','zoomOut','mapReset','tripSummaryBox','tripDistance','tripDuration',
    'clearRouteBtn','tripItineraryPills','spokeSearch','tabMapBtn','tabSpokesBtn','workspace',
    'btnLayerVoyager','btnLayerEsri','btnLayerOsm','btnLayerSatellite','routeStatusText'
  ];
  const el=Object.fromEntries(ids.map(id=>[id,new El(id)]));
  const opened=[];
  const markersCreated=[];

  let activeMarkers = [];
  const createLayer = () => {
    const layer = {
      items: [],
      addTo(){ return this; },
      clearLayers(){ if(this === mockMarkersLayer) activeMarkers = []; return this; },
      addLayer(m){ if(this === mockMarkersLayer) activeMarkers.push(m); return this; },
      addData(){ return this; },
      getBounds(){ return {}; },
      getLayers(){ return [1]; }
    };
    return layer;
  };

  let layerGroupCall = 0;
  let mockMarkersLayer = null;
  const mockMap={
    setView(){return this},
    zoomIn(){},
    zoomOut(){},
    flyToBounds(){},
    removeLayer(){},
    invalidateSize(){}
  };

  const mockL={
    map:()=>mockMap,
    tileLayer:()=>createLayer(),
    layerGroup:()=>{
      layerGroupCall++;
      const l = createLayer();
      if(layerGroupCall === 3) mockMarkersLayer = l;
      return l;
    },
    geoJSON:()=>createLayer(),
    polyline:()=>createLayer(),
    marker:(latlng,opts)=>({latlng,opts,bindPopup(){return this},on(){return this}}),
    divIcon:(opts)=>opts,
    latLngBounds:()=>({})
  };

  const window={
    ShuruKarCore:C,
    DISTRICT_BOUNDARIES:boundaries,
    L:mockL,
    open:u=>opened.push(u),
    addEventListener(){}
  };
  const document={
    getElementById:id=>el[id]||new El(id),
    querySelectorAll:()=>[],
    write(){}
  };

  const scripts=[...html.matchAll(/<script(?![^>]*src=)(.*?)<\/script>/gs)].map(x=>x[1].replace(/^[^>]*>/,''));
  const appScript=scripts[scripts.length-1];

  vm.runInNewContext(appScript,{
    window,
    document,
    DATA:rows,
    DISTRICT_BOUNDARIES:boundaries,
    L:mockL,
    URLSearchParams,
    encodeURIComponent,
    Set,
    Map,
    setTimeout:(fn)=>fn(),
    console,
    alert(){}
  });

  assert.equal(el.district.options.length,6);
  assert.equal(el.routeButton.disabled,true);

  for(const d of C.getDistricts(rows)){
    el.district.value=d;
    el.district.dispatch('change');
    assert.equal(el.hub.options.length,C.getHubOptions(rows,d).length,d);
    assert.ok(el.spokeList.nodes.length>0,d);
    const pts=C.getLocated(rows,d).map(r=>`${(+r.latitude).toFixed(5)},${(+r.longitude).toFixed(5)}`);
    assert.equal(activeMarkers.length,new Set(pts).size,d);
  }

  el.district.value='Patna';
  el.district.dispatch('change');
  const h=C.getHubOptions(rows,'Patna')[0];
  el.hub.value=h.id;
  el.hub.dispatch('change');
  assert.equal(el.spokeList.nodes.length,33);

  const checkbox=el.spokeList.nodes.find(n=>!n.checked);
  checkbox.checked=true;
  checkbox.dispatch('change');
  assert.equal(el.selectedBadge.textContent,'1 selected');
  assert.equal(el.routeButton.disabled,false);

  const checkbox2=el.spokeList.nodes.find(n=>!n.checked);
  checkbox2.checked=true;
  checkbox2.dispatch('change');
  assert.equal(el.selectedBadge.textContent,'2 selected');

  el.mode.value='transit';
  el.routeButton.dispatch('click');
  assert.equal(opened.length,1);
  const u=new URL(opened[0]);
  assert.equal(u.searchParams.get('travelmode'),'transit');
  assert.ok(u.searchParams.get('waypoints'));
});
