import{c as f,j as e}from"./index-ZXDSbn3Q.js";import{C as s,t as h,a as c}from"./TrendChart-8QyvN2GQ.js";import{g as u,n as m}from"./useFetch-DQ-mSdII.js";import{R as j,B as b,C as B,X as C,Y as L,T as S,a as g,b as R}from"./charts-CLjdseBC.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=f("Beef",[["circle",{cx:"12.5",cy:"8.5",r:"2.5",key:"9738u8"}],["path",{d:"M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z",key:"o0f6za"}],["path",{d:"m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5",key:"k7p6i0"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=f("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);function T({data:k=[],xKey:x="date",series:r,height:p=260,unit:o="",referenceY:l,referenceLabel:d,xFormatter:n=u}){const y=k.map(a=>{const t={...a};return r.forEach(i=>{t[i.key]=a[i.key]==null?0:Number(a[i.key])}),t});return e.jsx("div",{style:{height:p},className:"w-full",children:e.jsx(j,{children:e.jsxs(b,{data:y,margin:{top:8,right:8,left:-12,bottom:0},children:[e.jsx(B,{stroke:s.grid,vertical:!1}),e.jsx(C,{dataKey:x,tickFormatter:n,stroke:s.axis,fontSize:11,tickLine:!1,axisLine:!1,minTickGap:16}),e.jsx(L,{stroke:s.axis,fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:a=>m(a),width:48,allowDecimals:!1}),e.jsx(S,{...h,cursor:{fill:"rgba(128,128,128,0.12)"},labelFormatter:n,formatter:(a,t)=>[`${m(a,1)}${o?` ${o}`:""}`,t]}),l!=null&&e.jsx(g,{y:Number(l),stroke:s.amber,strokeDasharray:"5 4",label:{value:d,fill:s.amber,fontSize:11,position:"insideTopRight"}}),r.map((a,t)=>e.jsx(R,{dataKey:a.key,name:a.name,fill:a.color||c[t%c.length],radius:[6,6,0,0],maxBarSize:36},a.key))]})})})}export{T as B,E as F,w as a};
