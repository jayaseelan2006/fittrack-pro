import{c as h,j as t,E as x,f as d}from"./index-ZXDSbn3Q.js";import{r as m}from"./vendor-DX9ErTJF.js";import{T as p}from"./TrendChart-8QyvN2GQ.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=h("CalendarCheck",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m9 16 2 2 4-4",key:"19s6y9"}]]);function y({data:i=[],height:n=260}){const[o,c]=m.useState(""),s=i.filter(e=>{var a;return(a=e.points)==null?void 0:a.length});if(!s.length)return t.jsx(x,{text:"Finish a workout to see strength progress"});const r=s.find(e=>String(e.exercise_id)===String(o))||s[0];return t.jsxs("div",{children:[t.jsx("div",{className:"mb-3 max-w-xs",children:t.jsx(d,{value:r.exercise_id,onChange:e=>c(e.target.value),options:s.map(e=>({value:e.exercise_id,label:e.exercise_name}))})}),t.jsx(p,{data:r.points,series:[{key:"max_weight_kg",name:"Max weight",unit:"kg"}],height:n,unit:"kg"})]})}export{u as C,y as S};
